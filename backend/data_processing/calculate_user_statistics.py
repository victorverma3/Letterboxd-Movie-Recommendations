# imports
import os
import sys
import matplotlib

matplotlib.use("agg")

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(project_root)
import data_processing.database as database
from io import BytesIO
import matplotlib.pyplot as plt
import numpy as np
import seaborn as sns


# gets user statistics
async def get_user_statistics(user_df):

    # calculates user statistics
    user_stats = {
        "user_rating": {
            "mean": round(user_df["user_rating"].mean(), 3),
            "std": round(user_df["user_rating"].std(), 3),
        },
        "letterboxd_rating": {
            "mean": round(user_df["letterboxd_rating"].mean(), 3),
            "std": round(user_df["letterboxd_rating"].std(), 3),
        },
        "rating_differential": {
            "mean": round(user_df["rating_differential"].mean(), 3),
        },
        "letterboxd_rating_count": {
            "mean": int(user_df["letterboxd_rating_count"].mean()),
        },
    }

    return user_stats


# gets user rating distribution
async def get_user_rating_distribution(user, user_df):

    # plots the kde overlay of user rating and Letterboxd rating
    sns.set_theme()
    plt.clf()
    ax = sns.kdeplot(data=[user_df["user_rating"], user_df["letterboxd_rating"]], cut=0)
    ax.set(
        xlabel="Rating",
        ylabel="Density",
        title=f"{user}'s Rating Distribution",
    )

    # saves the pdf as bytes
    img_bytes = BytesIO()
    plt.savefig(img_bytes, format="png")
    img_bytes.seek(0)

    return img_bytes.getvalue()


# gets user percentiles
def get_user_percentiles(user_stats):

    # gets all user statistics from dataframe
    statistics = database.get_all_user_statistics()
    statistics["mean_rating_differential"] = (
        statistics["mean_user_rating"] - statistics["mean_letterboxd_rating"]
    )

    # calculates user percentiles
    percentiles = {}
    for category in [
        "user_rating",
        "letterboxd_rating",
        "rating_differential",
        "letterboxd_rating_count",
    ]:
        percentiles[f"{category}_percentile"] = round(
            np.sum(statistics[f"mean_{category}"] < user_stats[category]["mean"])
            / len(statistics)
            * 100,
            1,
        )

    return percentiles


# gets similarity score between two users
def get_user_similarity(usernames, dataframes):
    user1 = usernames["username1"]
    user2 = usernames["username2"]
    df1 = dataframes["user1"]
    df2 = dataframes["user2"]
    similarity = {"score": 0}
    return similarity
