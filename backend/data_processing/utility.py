# imports
import os
import sys

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(project_root)
import aiohttp
from data_processing.scrape_user_ratings import get_user_ratings


# exceptions
class CommonWatchlistError(Exception):
    def __init__(self, message, errors=None):
        super().__init__(message)
        self.errors = errors


# helper functions
async def get_user_dataframe(user, movie_data, update_urls):

    # gets and processes the user data
    try:
        async with aiohttp.ClientSession() as session:
            user_df, _ = await get_user_ratings(
                user, session, verbose=False, update_urls=update_urls
            )
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
        print(f"\nerror getting {user}'s dataframe:", e)
        raise e
