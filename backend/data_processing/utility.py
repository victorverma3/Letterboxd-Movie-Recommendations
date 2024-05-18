# imports
import os
import sys

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(project_root)
import aiohttp
import data_processing.database as database
from data_processing.scrape_user_ratings import get_user_ratings


async def get_user_dataframe(user):

    # gets and processes all movie data
    movie_data = database.get_movie_data()
    movie_data["title"] = movie_data["title"].astype("string")
    movie_data["url"] = movie_data["url"].astype("string")

    # gets and processes the user data
    try:
        async with aiohttp.ClientSession() as session:
            user_df, _ = await get_user_ratings(user, session, False)
        user_df["movie_id"] = user_df["movie_id"].astype("int")
        user_df["url"] = user_df["url"].astype("string")
        user_df["username"] = user_df["username"].astype("string")

        processed_user_df = user_df.merge(
            movie_data, how="left", on=["movie_id", "url"]
        )
        processed_user_df["rating_differential"] = (
            processed_user_df["user_rating"] - processed_user_df["letterboxd_rating"]
        )

        return processed_user_df
    except Exception as e:
        print(f"\nerror getting user dataframe")
        raise e
