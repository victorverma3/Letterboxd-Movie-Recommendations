import numpy as np
import os
import pandas as pd
import sys
from typing import Any, Dict, Literal, Sequence

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(project_root)

from data_processing.utils import (
    get_processed_user_df,
    RecommendationFilterException,
    WatchlistMoviesMissingException,
)
from model.general_model import load_general_model, prepare_general_features
from model.personalized_model import (
    prepare_personalized_features,
    train_personalized_model,
)


# Gets recommendations
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
    popularity: int,
) -> Dict[str, Any]:

    # Verifies parameters
    if num_recs < 1:
        raise ValueError("Number of recommendations must be an integer greater than 0")

    # Loads processed user df, unrated movies, and movie data
    processed_user_df, unrated, movie_data = await get_processed_user_df(user=user)

    # Trains recommendation model on processed user data
    if model_type == "personalized":
        model, _, _, _, _ = train_personalized_model(user_df=processed_user_df)
        print(f"Created {user}'s personalized recommendation model")
    elif model_type == "general":
        model = load_general_model()

    # Finds movies not seen by the user
    initial_mask = (~movie_data["movie_id"].isin(processed_user_df["movie_id"])) & (
        ~movie_data["movie_id"].isin(unrated)
    )
    unseen = movie_data.loc[initial_mask].copy()

    # Initializes filter mask
    filter_mask = pd.Series(True, index=unseen.index)

    # Adds genre filter to mask
    included_genres = [f"is_{genre}" for genre in genres]
    filter_mask &= unseen[included_genres].any(axis=1)

    # Adds special genre filter to mask
    special_genre_filters = {
        "animation": "is_animation",
        "horror": "is_horror",
        "documentary": "is_documentary",
    }
    for genre, col in special_genre_filters.items():
        if genre not in genres:
            filter_mask &= unseen[col] == 0

    # Adds content type filter to mask
    filter_mask &= unseen["content_type"].isin(content_types)

    # Adds release year filter to mask
    filter_mask &= (unseen["release_year"] >= min_release_year) & (
        unseen["release_year"] <= max_release_year
    )

    # Adds runtime filter to mask
    filter_mask &= (unseen["runtime"] >= min_runtime) & (
        unseen["runtime"] <= max_runtime
    )

    # Adds popularity filter to mask
    popularity_map = {
        1: 1,
        2: 0.7,
        3: 0.4,
        4: 0.2,
        5: 0.1,
        6: 0.05,
    }
    threshold = np.percentile(
        unseen["letterboxd_rating_count"],
        100 * (1 - popularity_map[popularity]),
    )
    filter_mask &= unseen["letterboxd_rating_count"] >= threshold

    # Applies all filters in mask
    unseen = unseen.loc[filter_mask]

    if len(unseen) == 0:
        raise RecommendationFilterException(
            "No movies fit the selected filter criteria"
        )

    # Prepares unseen feature data
    if model_type == "personalized":
        X_unseen = prepare_personalized_features(X=unseen)
    elif model_type == "general":
        X_unseen = prepare_general_features(X=unseen)

    # Predicts user ratings for unseen movies
    predicted_ratings = model.predict(X_unseen)

    # Trims predicted ratings to acceptable range
    unseen["predicted_rating"] = np.clip(predicted_ratings, 0.5, 5).astype("float32")

    # Rounds predicted ratings to 2 decimals
    unseen["predicted_rating"] = unseen["predicted_rating"].apply(
        lambda x: "{:.2f}".format(round(x, 2))
    )

    # Sorts recommendations from highest to lowest predicted rating
    recommendations = unseen.sort_values(by="predicted_rating", ascending=False)[
        ["title", "poster", "release_year", "predicted_rating", "url"]
    ].drop_duplicates(subset="url")

    return {"username": user, "recommendations": recommendations.iloc[:num_recs]}


async def recommend_n_watchlist_movies(
    num_recs: int,
    user: str,
    model_type: Literal["personalized", "collaborative", "general"],
    watchlist_pool: Sequence[str],
) -> Dict[str, Any]:

    # Verifies parameters
    if num_recs < 1:
        raise ValueError("Number of recommendations must be an integer greater than 0")

    # Loads processed user df and movie data
    processed_user_df, _, movie_data = await get_processed_user_df(user=user)

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

    if len(watchlist_movies) == 0:
        raise WatchlistMoviesMissingException(f"No movies on {user}'s watchlist")

    # Prepares watchlist feature data
    if model_type == "personalized":
        X_watchlist = prepare_personalized_features(X=watchlist_movies)
    elif model_type == "general":
        X_watchlist = prepare_general_features(X=watchlist_movies)

    # Predicts user ratings for watchlist movies
    predicted_ratings = model.predict(X_watchlist)

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
    )[["title", "poster", "release_year", "predicted_rating", "url"]].drop_duplicates(
        subset="url"
    )

    return {"username": user, "recommendations": recommendations.iloc[:num_recs]}


# Merges recommendations for multiple users
def merge_recommendations(
    num_recs: int, all_recommendations: Sequence[Dict[str, Any]]
) -> pd.DataFrame:

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
    dataframes = [item["recommendations"] for item in all_recommendations]
    merged_recommendations = dataframes[0]

    for df in dataframes[1:]:
        merged_recommendations = pd.merge(
            merged_recommendations,
            df,
            on=["title", "poster", "release_year", "url"],
            how="inner",
            copy=False,
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
