import aiohttp
import os
import pandas as pd
import sys
from typing import Dict

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(project_root)

from data_processing.scrape_user_ratings import get_user_ratings


# Custom exceptions
class RecommendationFilterException(Exception):
    def __init__(self, message, errors=None):
        super().__init__(message)
        self.errors = errors


class UserProfileException(Exception):
    def __init__(self, message, errors=None):
        super().__init__(message)
        self.errors = errors


class WatchlistEmptyException(Exception):
    def __init__(self, message, errors=None):
        super().__init__(message)
        self.errors = errors


class WatchlistMoviesMissingException(Exception):
    def __init__(self, message, errors=None):
        super().__init__(message)
        self.errors = errors


class WatchlistOverlapException(Exception):
    def __init__(self, message, errors=None):
        super().__init__(message)
        self.errors = errors


# Gets user rating dataframe
async def get_user_dataframe(
    user: str, movie_data: pd.DataFrame, update_urls: bool
) -> pd.DataFrame:

    # Gets and processes the user data
    try:
        async with aiohttp.ClientSession() as session:
            user_df, _ = await get_user_ratings(
                user, session, verbose=False, update_urls=update_urls
            )

        processed_user_df = user_df.merge(
            movie_data, how="left", on=["movie_id", "url"]
        )
        processed_user_df["rating_differential"] = (
            processed_user_df["user_rating"] - processed_user_df["letterboxd_rating"]
        )

        return processed_user_df
    except Exception:
        print(f"\nError getting {user}'s dataframe")
        raise UserProfileException("User has not rated enough movies")


# Converts genre integers into one-hot encoding
def process_genres(row: pd.DataFrame) -> Dict[str, int]:

    genre_options = [
        "action",
        "adventure",
        "animation",
        "comedy",
        "crime",
        "documentary",
        "drama",
        "family",
        "fantasy",
        "history",
        "horror",
        "music",
        "mystery",
        "romance",
        "science_fiction",
        "tv_movie",
        "thriller",
        "war",
        "western",
    ]

    genre_binary = bin(row["genres"])[2:].zfill(19)

    return {
        f"is_{genre}": int(genre_binary[pos]) for pos, genre in enumerate(genre_options)
    }
