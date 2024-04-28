import os
import sys

project_root = os.path.abspath(os.path.dirname(__file__))
sys.path.append(project_root)
from data_processing import database
from model.recommender import recommend_n_movies

from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
cors = CORS(app, origins="*")


@app.route("/api/users", methods=["GET"])
def users():
    users = database.get_users_in_db()
    return jsonify(users)


@app.route("/api/get-recommendations/<username>", methods=["GET"])
async def get_recommendations(username):
    recommendations = await recommend_n_movies(username, 25)
    return recommendations.to_json(orient="records", index=False)


if __name__ == "__main__":
    app.run(debug=True, port=3000)
