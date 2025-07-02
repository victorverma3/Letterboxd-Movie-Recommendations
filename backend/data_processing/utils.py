import aiohttp
from dotenv import load_dotenv
import json
import os
import pandas as pd
import sys
from typing import Dict, Sequence, Tuple
from upstash_redis import Redis

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(project_root)

from data_processing import database
from data_processing.scrape_user_ratings import get_user_ratings

load_dotenv()
redis = Redis(
    url=os.getenv("UPSTASH_REDIS_REST_URL"),
    token=os.getenv("UPSTASH_REDIS_REST_TOKEN"),
)


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
                user,
                session,
                exclude_liked=True,
                verbose=False,
                update_urls=update_urls,
            )

        processed_user_df = user_df.merge(
            movie_data, how="left", on=["movie_id", "url"]
        )
        processed_user_df["rating_differential"] = (
            processed_user_df["user_rating"] - processed_user_df["letterboxd_rating"]
        )

        return processed_user_df
    except Exception as e:
        print(f"\nError getting {user}'s dataframe:", e)
        raise Exception


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


# Gets processed user df, unrated movies, and movie data
async def get_processed_user_df(
    user: str,
) -> Tuple[pd.DataFrame, Sequence[int], pd.DataFrame]:

    # Gets and processes movie data from the database
    movie_data = database.get_movie_data()

    # Loads processed user df and unrated movies
    cache_key = f"user_cache:{user}"
    cached = redis.get(cache_key)

    if cached is not None:
        user_df, unrated = json.loads(cached)
        user_df = pd.DataFrame(user_df)

    else:
        try:
            async with aiohttp.ClientSession() as session:
                user_df, unrated = await get_user_ratings(
                    user, session, exclude_liked=True, verbose=False, update_urls=True
                )
        except Exception:
            raise UserProfileException("User has not rated enough movies")

        redis.set(
            cache_key,
            json.dumps((user_df.to_dict("records"), unrated)),
            ex=3600,
        )

    processed_user_df = user_df.merge(movie_data, on=["movie_id", "url"])

    return processed_user_df, unrated, movie_data
