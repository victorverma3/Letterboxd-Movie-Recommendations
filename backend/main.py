import asyncio
from flask import abort, Flask, jsonify, Response, request
from flask_cors import CORS
import json
import os
import sys
import time

project_root = os.path.abspath(os.path.dirname(__file__))
sys.path.append(project_root)

from data_processing import database
from data_processing.calculate_user_statistics import (
    get_user_percentiles,
    get_user_statistics,
)
from data_processing.utility import (
    get_user_dataframe,
    RecommendationFilterException,
    UserProfileException,
    WatchlistEmptyException,
    WatchlistOverlapException,
)
from data_processing.watchlist_picks import get_user_watchlist_picks
from model.recommender import merge_recommendations, recommend_n_movies

app = Flask(__name__)
cors = CORS(app, origins="*")


# Gets a list of users
@app.route("/api/users", methods=["GET"])
def users() -> Response:

    try:
        users = database.get_user_list()

        return jsonify(users)
    except Exception as e:
        print("Failed to get user list")
        raise e


# Gets movie recommendations for a user
@app.route("/api/get-recommendations", methods=["POST"])
async def get_recommendations() -> Response:

    start = time.perf_counter()

    data = request.json.get("currentQuery")
    usernames = data.get("usernames")
    genres = data.get("genres")
    content_types = data.get("content_types")
    min_release_year = data.get("min_release_year")
    max_release_year = data.get("max_release_year")
    min_runtime = data.get("min_runtime")
    max_runtime = data.get("max_runtime")
    popularity = data.get("popularity")

    # Gets movie recommedations
    try:
        if len(usernames) == 1:
            recommendations = await recommend_n_movies(
                usernames[0],
                100,
                genres,
                content_types,
                min_release_year,
                max_release_year,
                min_runtime,
                max_runtime,
                popularity,
            )

            recommendations = recommendations["recommendations"].to_dict(
                orient="records"
            )

            finish = time.perf_counter()
            print(
                f'\nGenerated movie recommendations for {", ".join(map(str, usernames))} in {finish - start} seconds'
            )

        else:
            tasks = [
                recommend_n_movies(
                    username,
                    500,
                    genres,
                    content_types,
                    min_release_year,
                    max_release_year,
                    min_runtime,
                    max_runtime,
                    popularity,
                )
                for username in usernames
            ]
            all_recommendations = await asyncio.gather(*tasks)

            # Merges recommendations
            merged_recommendations = merge_recommendations(100, all_recommendations)
            recommendations = merged_recommendations.to_dict(orient="records")

            finish = time.perf_counter()
            print(
                f'Generated movie recommendations for {", ".join(map(str, usernames))} in {finish - start} seconds'
            )

    except RecommendationFilterException as e:
        abort(406, e)
    except UserProfileException as e:
        abort(500, e)
    except Exception as e:
        abort(500, "Error getting recommendations")

    # Updates user logs in database
    try:
        database.update_many_user_logs(usernames)
        print(f'\nSuccessfully logged {", ".join(map(str, usernames))} in database')
    except:
        print(f'\nFailed to log {", ".join(map(str, usernames))} in database')

    return jsonify(recommendations)


# Gets user statistics
@app.route("/api/get-statistics", methods=["POST"])
async def get_statistics() -> Response:

    username = request.json.get("username")

    # Gets movie data from database
    try:
        movie_data = database.get_movie_data()
    except Exception as e:
        print("\nFailed to get movie data")
        raise e

    # Gets user dataframe
    try:
        user_df = await get_user_dataframe(username, movie_data, update_urls=True)
    except UserProfileException as e:
        abort(500, e)

    # Updates user log in database
    try:
        database.update_user_log(username)
        print(f"\nSuccessfully logged {username} in database")
    except:
        print(f"\nFailed to log {username} in database")

    # Gets user stats
    try:
        user_stats = await get_user_statistics(user_df)
        statistics = {"simple_stats": user_stats}
    except:
        abort(500, "Failed to calculate user statistics")

    # Updates user stats in database
    try:
        database.update_user_statistics(username, user_stats)
        print(f"\nSuccessfully updated statistics for {username} in database")
    except:
        print(f"\nFailed to update statistics for {username} in database")

    # Gets user distribution values
    statistics["distribution"] = {
        "user_rating_values": user_df["user_rating"].tolist(),
        "letterboxd_rating_values": user_df["letterboxd_rating"].dropna().tolist(),
    }

    # Gets user percentiles
    try:
        user_percentiles = get_user_percentiles(user_stats)
        statistics["percentiles"] = user_percentiles
    except:
        abort(500, "Failed to get user percentiles")

    return jsonify(statistics)


# Gets watchlist picks
@app.route("/api/get-watchlist-picks", methods=["POST"])
async def get_watchlist_picks() -> Response:

    data = request.json.get("data")
    user_list = data.get("userList")
    overlap = data.get("overlap")
    pick_type = data.get("pickType")
    num_picks = data.get("numPicks")

    # Gets watchlist picks
    try:
        watchlist_picks = await get_user_watchlist_picks(
            user_list, overlap, pick_type, num_picks
        )
    except WatchlistOverlapException as e:
        abort(406, e)
    except WatchlistEmptyException as e:
        abort(500, e)

    # Updates user logs in database
    try:
        database.update_many_user_logs(user_list)
        print(f'\nSuccessfully logged {", ".join(map(str, user_list))} in database')
    except:
        print(f'\nFailed to log {", ".join(map(str, user_list))} in database')

    return jsonify(watchlist_picks)


# Gets application metrics
@app.route("/api/get-application-metrics", methods=["GET"])
async def get_application_metrics() -> Response:

    try:
        metrics = database.get_application_metrics()

        return jsonify(metrics)
    except Exception as e:
        print(e)
        abort(500, "Failed to get application metrics")


# Gets release notes
@app.route("/api/get-release-notes", methods=["GET"])
async def get_release_notes() -> Response:

    try:
        with open("data/release_notes.json", "r") as f:
            notes = json.load(f)

        return jsonify(notes)
    except Exception as e:
        print(e)
        abort(500, "Failed to get release notes")


if __name__ == "__main__":

    app.run(debug=True, port=3000)
