import aiohttp
from dotenv import load_dotenv
from flask import current_app
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
from infra.custom_exceptions import UserProfileException

load_dotenv()

# Connects to Upstash Redis
redis_url = os.getenv("UPSTASH_REDIS_REST_URL", None)
redis_token = os.getenv("UPSTASH_REDIS_REST_TOKEN", None)

if not redis_url or not redis_token:
    print("Missing Redis credentials", file=sys.stderr)
else:
    redis = Redis(
        url=redis_url,
        token=redis_token,
    )


GENRES = [
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

DECADES = [
    1880,
    1890,
    1900,
    1910,
    1920,
    1930,
    1940,
    1950,
    1960,
    1970,
    1980,
    1990,
    2000,
    2010,
    2020,
]

ERAS = ["silent", "sound", "color", "modern"]

COUNTRY_MAP = {
    "USA": 0,
    "UK": 1,
    "China": 2,
    "France": 3,
    "Japan": 4,
    "Germany": 5,
    "South Korea": 6,
    "Canada": 7,
    "India": 8,
    "Australia": 9,
    "Hong Kong": 10,
    "Italy": 11,
    "Spain": 12,
    "Brazil": 13,
    "USSR": 14,
}

NUMERIC_COLS = [
    "release_year",
    "runtime",
    "letterboxd_rating",
    "letterboxd_rating_count",
]

CATEGORICAL_COLS = ["country_of_origin"]

BINARY_COLS = [
    "is_action",
    "is_adventure",
    "is_animation",
    "is_comedy",
    "is_crime",
    "is_documentary",
    "is_drama",
    "is_family",
    "is_fantasy",
    "is_history",
    "is_horror",
    "is_music",
    "is_mystery",
    "is_romance",
    "is_science_fiction",
    "is_tv_movie",
    "is_thriller",
    "is_war",
    "is_western",
    "is_movie",
]


async def get_user_dataframe(
    user: str, movie_data: pd.DataFrame, update_urls: bool
) -> pd.DataFrame:
    """
    Gets user rating dataframe.
    """
    # Gets and processes the user data
    try:
        async with aiohttp.ClientSession() as session:
            user_df, _ = await get_user_ratings(
                user=user,
                session=session,
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
    except UserProfileException as e:
        print(e, file=sys.stderr)
        raise e
    except Exception as e:
        print(f"Failed to get {user}'s dataframe: {e}", file=sys.stderr)
        raise e


def process_genres(row: pd.DataFrame) -> Dict[str, int]:
    """
    Converts genre integers into one-hot encoding.
    """
    genres_int = row["genres"]
    genre_dict = {}
    for i, genre in enumerate(reversed(GENRES)):
        genre_dict[f"is_{genre}"] = (genres_int >> i) & 1

    return genre_dict


async def get_processed_user_df(
    user: str, update_urls: bool = True
) -> Tuple[pd.DataFrame, Sequence[int], pd.DataFrame]:
    """
    Gets processed user df, unrated movies, and movie data.
    """
    # Gets and processes movie data from the database
    movie_data = database.get_movie_data()

    # Loads processed user df and unrated movies
    if current_app.config.get("TESTING"):
        cache_key = f"test:user_df:{user}"
    else:
        cache_key = f"user_df:{user}"
    cached = redis.get(cache_key)

    if cached is not None:
        user_df, unrated = json.loads(cached)
        user_df = pd.DataFrame(user_df)
    else:
        try:
            async with aiohttp.ClientSession() as session:
                user_df, unrated = await get_user_ratings(
                    user=user,
                    session=session,
                    exclude_liked=True,
                    verbose=False,
                    update_urls=update_urls,
                )
        except UserProfileException as e:
            print(e, file=sys.stderr)
            raise e
        except Exception as e:
            print(e, file=sys.stderr)
            raise e

        try:
            redis.set(
                cache_key,
                json.dumps((user_df.to_dict("records"), unrated)),
                ex=3600,
            )
        except Exception as e:
            print(e, file=sys.stderr)
            print(f"Failed to add {user}'s rating data to cache", file=sys.stderr)

    processed_user_df = user_df.merge(movie_data, on=["movie_id", "url"])

    return processed_user_df, unrated, movie_data


def determine_era(year: float) -> str:
    """
    Determines the era given the year.
    """
    if year < 1880:
        raise ValueError("Year must be an integer >= 1880")

    if year >= 1880 and year < 1925:
        return "silent"
    elif year >= 1925 and year < 1965:
        return "sound"
    elif year >= 1965 and year < 2000:
        return "color"
    else:
        return "modern"
