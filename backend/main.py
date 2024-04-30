import os
import sys

project_root = os.path.abspath(os.path.dirname(__file__))
sys.path.append(project_root)
from data_processing import database
from data_processing.calculate_user_statistics import (
    get_user_statistics,
    get_user_rating_distribution,
)
from data_processing.utility import get_user_dataframe
from io import BytesIO
from model.recommender import recommend_n_movies
import pandas as pd

from flask import Flask, jsonify, request, send_file
from flask_cors import CORS

app = Flask(__name__)
cors = CORS(app, origins="*")


# gets a list of users
@app.route("/api/users", methods=["GET"])
def users():
    users = database.get_users_in_db()
    return jsonify(users)


# gets movie recommendations for a user
@app.route("/api/get-recommendations/<username>", methods=["GET"])
async def get_recommendations(username):
    recommendations = await recommend_n_movies(username, 25)
    return recommendations.to_json(orient="records", index=False)


# gets a user's dataframe
@app.route("/api/get-dataframe/<username>", methods=["GET"])
async def get_dataframe(username):
    user_df = await get_user_dataframe(username)
    return user_df.to_json(orient="records", index=False)


# gets statistics for a user
@app.route("/api/get-statistics", methods=["POST"])
async def get_statistics():
    user_df = request.json.get("dataframe")
    user_df = pd.DataFrame(user_df)
    user_statistics = await get_user_statistics(user_df)
    return jsonify(user_statistics)


# gets rating distribution for a user
@app.route("/api/get-rating-distribution/<username>", methods=["POST"])
async def get_rating_distribution(username):
    user_df = request.json.get("dataframe")
    user_df = pd.DataFrame(user_df)
    user_rating_distribution = await get_user_rating_distribution(username, user_df)
    return send_file(BytesIO(user_rating_distribution), mimetype="image/png")


if __name__ == "__main__":
    app.run(debug=True, port=3000)
