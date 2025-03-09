# imports
import aiohttp
import asyncio
import matplotlib.pyplot as plt
import os
import pandas as pd
import seaborn as sns
import sys
from typing import Tuple

project_root = os.path.dirname((os.path.join(os.path.dirname(__file__), "../..")))
sys.path.append(project_root)

import data_processing.database as database
from data_processing.scrape_user_ratings import get_user_ratings
from data_processing.utility import process_genres, UserProfileException
from model.recommender import train_model


# gets and processes movie data from the database
async def get_processed_movie_data() -> pd.DataFrame:

    movie_data = database.get_movie_data()
    genre_columns = movie_data[["genres"]].apply(
        process_genres, axis=1, result_type="expand"
    )
    movie_data = pd.concat([movie_data, genre_columns], axis=1)
    movie_data["url"] = movie_data["url"].astype("string")
    movie_data["title"] = movie_data["title"].astype("string")
    movie_data["poster"] = movie_data["poster"].astype("string")

    return movie_data


# gets and processes the user data
async def get_processed_user_data(user: str) -> pd.DataFrame:

    try:
        async with aiohttp.ClientSession() as session:
            user_df, _ = await get_user_ratings(
                user, session, verbose=False, update_urls=True
            )
    except Exception:
        raise UserProfileException("User has not rated enough movies")

    user_df["movie_id"] = user_df["movie_id"].astype(int)
    user_df["url"] = user_df["url"].astype("string")
    user_df["username"] = user_df["username"].astype("string")

    return user_df


# evalutes recommendation model
async def evaluate_recommendation_model(
    movie_data: pd.DataFrame, user: str
) -> Tuple[int, float, float, float, float, float]:

    # gets and processes the user data
    user_df = await get_processed_user_data(user)
    processed_user_df = user_df.merge(movie_data, on=["movie_id", "url"])

    # trains recommendation model on processed user data
    _, rmse_cv, rmse_test, rounded_rmse_test, rmse_val, rounded_rmse_val = train_model(
        user_df=processed_user_df
    )

    return (
        len(processed_user_df),
        rmse_cv,
        rmse_test,
        rounded_rmse_test,
        rmse_val,
        rounded_rmse_val,
    )


# plots rmse values
def plot_rmse_values(accuracy_df: pd.DataFrame):

    plt.figure(figsize=(10, 6))

    sns.lineplot(
        data=accuracy_df, x="num_rated", y="rmse_cv", label="RMSE CV", marker="o"
    )
    sns.lineplot(
        data=accuracy_df, x="num_rated", y="rmse_test", label="RMSE Test", marker="s"
    )
    sns.lineplot(
        data=accuracy_df,
        x="num_rated",
        y="rounded_rmse_test",
        label="Rounded RMSE Test",
        marker="D",
    )
    sns.lineplot(
        data=accuracy_df, x="num_rated", y="rmse_val", label="RMSE Val", marker="^"
    )
    sns.lineplot(
        data=accuracy_df,
        x="num_rated",
        y="rounded_rmse_val",
        label="Rounded RMSE Val",
        marker="v",
    )

    plt.xlabel("Number of Rated Movies")
    plt.ylabel("Root Mean Squared Error")
    plt.title("RMSE as a Function of Number of Rated Movies")
    plt.legend()
    plt.grid(True)
    plt.savefig("./figures/rmse_plot.png")


async def main():

    # gets and processes movie data from the database
    movie_data = await get_processed_movie_data()

    # tests recommendation model
    users = [
        "harryzielinski",
        "hgrosse",
        "jconn8",
        "kishkes88",
        "kmorrow16",
        "media_scouting",
        "rohankumar",
        "tmarro13",
        "victorverma",
        "zachrichards",
    ]
    metrics = []
    tasks = [
        evaluate_recommendation_model(movie_data=movie_data, user=user)
        for user in users
    ]
    metrics = await asyncio.gather(*tasks)

    # plots rmse values
    accuracy_df = pd.DataFrame(
        metrics,
        columns=[
            "num_rated",
            "rmse_cv",
            "rmse_test",
            "rounded_rmse_test",
            "rmse_val",
            "rounded_rmse_val",
        ],
    )
    plot_rmse_values(accuracy_df=accuracy_df)


if __name__ == "__main__":
    asyncio.run(main())
