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
import seaborn as sns


# Program
async def get_user_statistics(username, user_df):

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
            "mean": round(user_df["letterboxd_rating_count"].mean(), 3),
        },
    }

    # updates user data in database
    try:
        database.update_user_statistics(username, user_stats)
        print(f"\nsuccessfully updated {username}'s statistics in database")
    except:
        print(f"\nfailed to update {username}'s statistics in database")

    return user_stats


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
