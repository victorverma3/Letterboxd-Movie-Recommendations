import os
import sys

project_root = os.path.abspath(os.path.dirname(__file__))
sys.path.append(project_root)
from data_processing import database
from data_processing.calculate_user_statistics import (
    get_user_percentiles,
    get_user_statistics,
    get_user_rating_distribution,
)
from data_processing.utility import get_user_dataframe
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
    data = request.json.get("data")
    username = data.get("username")
    popularity = data.get("popularity")
    try:
        recommendations = await recommend_n_movies(username, 25, popularity)
    except ValueError:
        abort(400, "user has not rated enough movies")

    # updates user log in database
    try:
        database.update_user_log(username)
        print(f"\nsuccessfully logged user in database")
    except:
        print(f"\nfailed to log user in database")

    return recommendations.to_json(orient="records", index=False)


# gets a user's dataframe
@app.route("/api/get-dataframe", methods=["POST"])
async def get_dataframe():
    username = request.json.get("username")
    try:
        user_df = await get_user_dataframe(username)
    except ValueError:
        abort(400, "user has not rated enough films")

    # updates user log in database
    try:
        database.update_user_log(username)
        print(f"\nsuccessfully logged user in database")
    except:
        print(f"\nfailed to log user in database")

    return user_df.to_json(orient="records", index=False)


# gets statistics for a user
@app.route("/api/get-statistics", methods=["POST"])
async def get_statistics():
    username = request.json.get("username")
    user_df = request.json.get("dataframe")
    user_df = pd.DataFrame(user_df)
    user_statistics = await get_user_statistics(username, user_df)
    return jsonify(user_statistics)


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


if __name__ == "__main__":
    app.run(debug=True, port=3000)
