from functools import reduce
import gc
import numpy as np
import os
import pandas as pd
import sys
from typing import Any, Dict, Literal, Sequence

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(project_root)

from data_processing.utils import get_processed_user_df
from infra.custom_exceptions import (
    RecommendationFilterException,
    UserProfileException,
    WatchlistEmptyException,
)
from model.general_model import load_general_model, prepare_general_features
from model.personalized_model import (
    prepare_personalized_features,
    train_personalized_model,
)


async def recommend_n_movies(
    num_recs: int,
    user: str,
    model_type: Literal["personalized", "collaborative", "general"],
    genres: Sequence[str],
    content_types: Sequence[str],
    min_release_year: int,
    max_release_year: int,
    min_runtime: int,
    max_runtime: int,
    popularity: Sequence[str],
    highly_rated: bool,
    allow_rewatches: bool,
) -> Dict[str, Any]:
    """
    Gets recommendations.
    """
    # Verifies parameters
    if num_recs < 1:
        print(
            "Number of recommendations must be an integer greater than 0",
            file=sys.stderr,
        )
        raise ValueError("Number of recommendations must be an integer greater than 0")

    # Loads processed user df, unrated movies, and movie data
    try:
        processed_user_df, unrated, movie_data = await get_processed_user_df(user=user)
    except UserProfileException as e:
        print(e, file=sys.stderr)
        raise e
    except Exception as e:
        print(e, file=sys.stderr)
        raise e

    # Trains recommendation model on processed user data
    if model_type == "personalized":
        model, _, _, _, _ = train_personalized_model(user_df=processed_user_df)
        print(f"Created {user}'s personalized recommendation model")
    elif model_type == "general":
        model = load_general_model()

    # Gets recommendation pool for user
    merged = movie_data.merge(
        processed_user_df[["title", "release_year", "runtime"]],
        on=["title", "release_year", "runtime"],
        how="left",
        indicator=True,
    )
    if not allow_rewatches:
        initial_mask = (~movie_data["movie_id"].isin(processed_user_df["movie_id"])) & (
            ~movie_data["movie_id"].isin(unrated) & (merged["_merge"] == "left_only")
        )
        pool = movie_data.loc[initial_mask].copy()
    else:
        pool = movie_data.copy()
    del processed_user_df, unrated, merged
    gc.collect()

    # Included genres
    included_genres = [f"is_{genre}" for genre in genres]

    # Special genre filters
    special_genres = [
        genre
        for genre in ["is_animation", "is_horror", "is_documentary"]
        if genre not in included_genres
    ]

    # Creates popularity mask
    popularity_map = {
        "low": (0, 33),
        "medium": (33, 67),
        "high": (67, 100),
    }

    popularity_cutoffs = {}
    for pop in popularity:
        low_p, high_p = popularity_map[pop]
        lower = movie_data["letterboxd_rating_count"].quantile(low_p / 100)
        upper = movie_data["letterboxd_rating_count"].quantile(high_p / 100)
        popularity_cutoffs[pop] = (lower, upper)

    del movie_data
    gc.collect()

    popularity_mask = pd.Series(False, index=pool.index)
    for lower, upper in popularity_cutoffs.values():
        popularity_mask |= (pool["letterboxd_rating_count"] >= lower) & (
            pool["letterboxd_rating_count"] <= upper
        )

    # Minimum rating threshold
    if highly_rated:
        minimum_rating_threshold = 3.5
    else:
        minimum_rating_threshold = 0

    # Applies all filters
    pool = pool[
        pool[included_genres].any(axis=1)
        & pool[special_genres].eq(0).all(axis=1)
        & pool["content_type"].isin(content_types)
        & (pool["release_year"] >= min_release_year)
        & (pool["release_year"] <= max_release_year)
        & (pool["runtime"] >= min_runtime)
        & (pool["runtime"] <= max_runtime)
        & popularity_mask
        & (pool["letterboxd_rating"] >= minimum_rating_threshold)
    ]

    if len(pool) == 0:
        print("No movies fit within the filter criteria", file=sys.stderr)
        raise RecommendationFilterException("No movies fit within the filter criteria")

    # Prepares pool feature data
    if model_type == "personalized":
        X_pool = prepare_personalized_features(X=pool)
    elif model_type == "general":
        X_pool = prepare_general_features(X=pool)

    # Predicts user ratings for pool movies
    predicted_ratings = model.predict(X_pool)
    del X_pool
    gc.collect()

    # Trims predicted ratings to acceptable range
    pool["predicted_rating"] = np.clip(predicted_ratings, 0.5, 5).astype("float32")

    # Rounds predicted ratings to 2 decimals
    pool["predicted_rating"] = pool["predicted_rating"].apply(
        lambda x: "{:.2f}".format(round(x, 2))
    )

    # Sorts recommendations from highest to lowest predicted rating
    recommendations = pool.sort_values(
        by="predicted_rating", ascending=False
    ).drop_duplicates(subset=["title", "release_year", "runtime"])[
        ["title", "poster", "release_year", "predicted_rating", "url"]
    ]

    return {"username": user, "recommendations": recommendations.iloc[:num_recs]}


async def recommend_n_watchlist_movies(
    num_recs: int,
    user: str,
    model_type: Literal["personalized", "collaborative", "general"],
    watchlist_pool: Sequence[str],
) -> Dict[str, Any]:
    """
    Gets watchlist recommendations.
    """
    # Verifies parameters
    if num_recs < 1:
        raise ValueError("Number of recommendations must be an integer greater than 0")

    # Loads processed user df and movie data
    try:
        processed_user_df, _, movie_data = await get_processed_user_df(user=user)
    except UserProfileException as e:
        print(e, file=sys.stderr)
        raise e
    except Exception as e:
        print(e, file=sys.stderr)
        raise e

    # Trains recommendation model on processed user data
    if model_type == "personalized":
        model, _, _, _, _ = train_personalized_model(user_df=processed_user_df)
        print(f"Created {user}'s personalized recommendation model")
    elif model_type == "general":
        model = load_general_model()

    # Collects movies on watchlist
    watchlist_pool = [
        url.replace("https://www.letterboxd.com", "") for url in watchlist_pool
    ]
    watchlist_movies = movie_data[movie_data["url"].isin(watchlist_pool)].copy()
    del watchlist_pool, processed_user_df, movie_data
    gc.collect()

    if len(watchlist_movies) == 0:
        print(f"{user}'s watchlist is empty", file=sys.stderr)
        raise WatchlistEmptyException(f"{user}'s watchlist is empty")

    # Prepares watchlist feature data
    if model_type == "personalized":
        X_watchlist = prepare_personalized_features(X=watchlist_movies)
    elif model_type == "general":
        X_watchlist = prepare_general_features(X=watchlist_movies)

    # Predicts user ratings for watchlist movies
    predicted_ratings = model.predict(X_watchlist)
    del X_watchlist
    gc.collect()

    # Trims predicted ratings to acceptable range
    watchlist_movies["predicted_rating"] = np.clip(predicted_ratings, 0.5, 5).astype(
        "float32"
    )

    # Rounds predicted ratings to 2 decimals
    watchlist_movies["predicted_rating"] = watchlist_movies["predicted_rating"].apply(
        lambda x: "{:.2f}".format(round(x, 2))
    )

    # Sorts recommendations from highest to lowest predicted rating
    recommendations = watchlist_movies.sort_values(
        by="predicted_rating", ascending=False
    ).drop_duplicates(subset=["title", "release_year", "runtime"])[
        ["title", "poster", "release_year", "predicted_rating", "url"]
    ]

    return {"username": user, "recommendations": recommendations.iloc[:num_recs]}


def merge_recommendations(
    num_recs: int, all_recommendations: Sequence[Dict[str, Any]]
) -> pd.DataFrame:
    """
    Merges recommendations for multiple users.
    """
    # Renames predicted rating columns to be unique
    for item in all_recommendations:
        item["recommendations"].rename(
            columns={"predicted_rating": f'{item["username"]}_predicted_rating'},
            inplace=True,
        )
        item["recommendations"][f'{item["username"]}_predicted_rating'] = item[
            "recommendations"
        ][f'{item["username"]}_predicted_rating'].astype("float32")

    # Merges dataframes to only include movies recommended for all users
    merged_recommendations = reduce(
        lambda left, right: pd.merge(
            left,
            right,
            on=["title", "poster", "release_year", "url"],
            how="inner",
            copy=False,
        ),
        (item["recommendations"] for item in all_recommendations),
    )

    # Calculates average predicted rating
    predicted_rating_columns = [
        col
        for col in merged_recommendations.columns
        if col.endswith("_predicted_rating")
    ]

    merged_recommendations["predicted_rating"] = (
        merged_recommendations[predicted_rating_columns]
        .astype(float)
        .mean(axis=1)
        .round(2)
    )

    merged_recommendations.drop(columns=predicted_rating_columns, inplace=True)

    # Sorts recommendations from highest to lowest predicted average rating
    final_merged_recommendations = merged_recommendations.sort_values(
        by="predicted_rating", ascending=False
    )[["title", "poster", "release_year", "predicted_rating", "url"]].drop_duplicates(
        subset="url"
    )

    return final_merged_recommendations.iloc[:num_recs]
