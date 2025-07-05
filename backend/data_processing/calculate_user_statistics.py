import numpy as np
import os
import pandas as pd
import sys
from typing import Any, Dict

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(project_root)

import data_processing.database as database


# Gets average genre ratings
def get_average_genre_ratings(user_df: pd.DataFrame) -> Dict[str, Dict[str, float]]:

    genre_averages = {
        "action": {},
        "adventure": {},
        "animation": {},
        "comedy": {},
        "crime": {},
        "documentary": {},
        "drama": {},
        "family": {},
        "fantasy": {},
        "history": {},
        "horror": {},
        "music": {},
        "mystery": {},
        "romance": {},
        "science_fiction": {},
        "tv_movie": {},
        "thriller": {},
        "war": {},
        "western": {},
    }

    for genre in genre_averages:
        temp = user_df.loc[user_df[f"is_{genre}"] == 1]
        genre_averages[genre]["mean_user_rating"] = round(temp["user_rating"].mean(), 3)
        genre_averages[genre]["mean_rating_differential"] = round(
            temp["rating_differential"].mean(), 3
        )

    # Converts NaN values to string N/A
    for key in genre_averages:
        for subkey in genre_averages[key]:
            if pd.isna(genre_averages[key][subkey]):
                genre_averages[key][subkey] = "N/A"

    return genre_averages


# Gets user statistics
async def get_user_statistics(
    user_df: pd.DataFrame,
) -> Dict[str, Any]:

    # Calculates user statistics
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
        "genre_averages": get_average_genre_ratings(user_df=user_df),
    }

    return user_stats


# Gets user percentiles
def get_user_percentiles(user_stats: Dict[str, Any]) -> Dict[str, float]:

    # Loads all statistics from database
    statistics = database.get_all_user_statistics()
    statistics["mean_rating_differential"] = (
        statistics["mean_user_rating"] - statistics["mean_letterboxd_rating"]
    )

    # Calculates user percentiles
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
