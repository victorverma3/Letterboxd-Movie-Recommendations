import os
import sys

project_root = os.path.abspath(os.path.dirname(__file__))
sys.path.append(project_root)
from data_processing import database
from data_processing.calculate_user_statistics import (
    get_user_percentiles,
    get_user_rating_distribution,
    get_user_similarity,
    get_user_statistics,
)
from data_processing.utility import CommonWatchlistError, get_user_dataframe
from data_processing.watchlist_picks import get_user_watchlist_picks
from io import BytesIO
from model.recommender import recommend_n_movies
import pandas as pd

from flask import abort, Flask, jsonify, request, send_file
from flask_cors import CORS

app = Flask(__name__)
cors = CORS(app, origins="*")


# gets a list of users
@app.route("/api/users", methods=["GET"])
def users():

    users = database.get_user_log()

    return jsonify(users)


# gets movie recommendations for a user
@app.route("/api/get-recommendations", methods=["POST"])
async def get_recommendations():

    data = request.json.get("currentQuery")
    username = data.get("username")
    popularity = data.get("popularity")
    release_year = data.get("release_year")
    genres = data.get("genres")
    runtime = data.get("runtime")

    # updates user log in database
    try:
        database.update_user_log(username)
        print(f"\nsuccessfully logged user in database")
    except:
        print(f"\nfailed to log user in database")

    # gets movie recommedations
    try:
        recommendations = await recommend_n_movies(
            username, 25, popularity, release_year, genres, runtime
        )
    except ValueError:
        abort(400, "user has not rated enough movies")
    except:
        abort(500, "error getting recommendations")

    return recommendations.to_json(orient="records", index=False)


# gets a user's dataframe
@app.route("/api/get-dataframe", methods=["POST"])
async def get_dataframe():

    username = request.json.get("username")

    # updates user log in database
    try:
        database.update_user_log(username)
        print(f"\nsuccessfully logged user in database")
    except:
        print(f"\nfailed to log user in database")

    # gets movie data from database
    try:
        movie_data = database.get_movie_data()
    except Exception as e:
        print("\nfailed to get movie data")
        raise e

    # gets user dataframe
    try:
        user_df = await get_user_dataframe(username, movie_data)
    except ValueError:
        abort(400, "user has not rated enough films")

    return user_df.to_json(orient="records", index=False)


# gets statistics for a user
@app.route("/api/get-statistics", methods=["POST"])
async def get_statistics():

    username = request.json.get("username")
    user_df = request.json.get("dataframe")
    user_df = pd.DataFrame(user_df)
    user_stats = await get_user_statistics(user_df)

    # updates user stats in database
    try:
        database.update_user_statistics(username, user_stats)
        print(f"\nsuccessfully updated user statistics in database")
    except:
        print(f"\nfailed to update user statistics in database")

    return jsonify(user_stats)


# gets rating distribution for a user
@app.route("/api/get-rating-distribution", methods=["POST"])
async def get_rating_distribution():

    username = request.json.get("username")
    user_df = request.json.get("dataframe")
    user_df = pd.DataFrame(user_df)
    user_rating_distribution = await get_user_rating_distribution(username, user_df)

    return send_file(BytesIO(user_rating_distribution), mimetype="image/png")


# gets user statistic percentiles
@app.route("/api/get-percentiles", methods=["POST"])
def get_percentiles():

    user_stats = request.json.get("user_stats")
    user_percentiles = get_user_percentiles(user_stats)

    return jsonify(user_percentiles)


# compares profiles of two users
@app.route("/api/compare-users", methods=["POST"])
def get_comparison():
    usernames = request.json.get("usernames")
    user_dfs = request.json.get("dataframes")

    # gets user similarity data
    try:
        similarity = get_user_similarity(usernames, user_dfs)
    except:
        abort(500, "error getting similarities")

    return jsonify(similarity)


# gets watchlist picks
@app.route("/api/get-watchlist-picks", methods=["POST"])
async def get_watchlist_picks():

    data = request.json.get("data")
    user_list = data.get("userList")
    overlap = data.get("overlap")
    num_picks = data.get("numPicks")

    # updates user logs in database
    try:
        database.update_many_user_logs(user_list)
        print(f"\nsuccessfully logged user(s) in database")
    except:
        print(f"\nfailed to log user(s) in database")

    # gets watchlist picks
    try:
        picks = await get_user_watchlist_picks(user_list, overlap, num_picks)
        return jsonify(picks)
    except CommonWatchlistError:
        abort(400, "there is no overlap across all user watchlists")


if __name__ == "__main__":

    app.run(debug=True, port=3000)
