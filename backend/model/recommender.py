import aiohttp
import numpy as np
import os
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import root_mean_squared_error
from sklearn.model_selection import train_test_split
import sys
from typing import Any, Dict, Literal, Sequence, Tuple
from xgboost import XGBRegressor

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(project_root)

import data_processing.database as database
from data_processing.scrape_user_ratings import get_user_ratings
from data_processing.utils import (
    process_genres,
    RecommendationFilterException,
    UserProfileException,
    WatchlistMoviesMissingException,
)


# Trains recommender model
def train_model(
    user_df: pd.DataFrame, modelType: Literal["RF", "XG"] = "RF", verbose: bool = False
) -> Tuple[XGBRegressor | RandomForestRegressor, float, float, float, float]:

    # Creates user feature data
    X = user_df.drop(
        columns=[
            "movie_id",
            "title",
            "poster",
            "user_rating",
            "liked",
            "url",
            "username",
        ]
    )
    X["is_movie"] = (X["content_type"] == "movie").astype(int)
    X.drop(columns=["content_type"], inplace=True)

    # Creates user target data
    y = user_df["user_rating"]

    # Creates train-test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=0
    )

    # Creates test-validation split
    X_test, X_val, y_test, y_val = train_test_split(
        X_test, y_test, test_size=0.5, random_state=0
    )

    # Initializes model
    if modelType == "XG":
        model = XGBRegressor(
            enable_categorical=True, n_estimators=200, max_depth=3, learning_rate=0.05
        )
    elif modelType == "RF":
        model = RandomForestRegressor(
            random_state=0, max_depth=10, min_samples_split=10, n_estimators=100
        )

    # Fits recommendation model on user training data
    model.fit(X_train, y_train)

    # Calculates mse on test data
    y_pred_test = model.predict(X_test)
    rmse_test = root_mean_squared_error(y_test, y_pred_test)
    rounded_rmse_test = root_mean_squared_error(y_test, np.round(y_pred_test * 2) / 2)

    # Calculates mse on validation data
    y_pred_val = model.predict(X_val)
    rmse_val = root_mean_squared_error(y_val, y_pred_val)
    rounded_rmse_val = root_mean_squared_error(y_val, np.round(y_pred_val * 2) / 2)

    # results_df = pd.DataFrame(
    #     {"actual_user_rating": y_val, "predicted_user_rating": y_pred_val.flatten()}
    # )

    # Prints accuracy evaluation values
    if verbose:
        print("Test RMSE:", rmse_test)
        print("Validation RMSE:", rmse_val)
        # print(results_df)

    return model, rmse_test, rounded_rmse_test, rmse_val, rounded_rmse_val


# Gets recommendations
async def recommend_n_movies(
    user: str,
    n: int,
    genres: Sequence[str],
    content_types: Sequence[str],
    min_release_year: int,
    max_release_year: int,
    min_runtime: int,
    max_runtime: int,
    popularity: int,
) -> Dict[str, Any]:

    # Verifies parameters
    if n < 1:
        raise ValueError("number of recommendations must be an integer greater than 0")

    # Gets and processes movie data from the database
    movie_data = database.get_movie_data()

    # Gets and processes the user data
    try:
        async with aiohttp.ClientSession() as session:
            user_df, unrated = await get_user_ratings(
                user, session, verbose=False, update_urls=True
            )
    except Exception as e:
        raise UserProfileException("User has not rated enough movies")

    user_df["movie_id"] = user_df["movie_id"].astype(int)
    user_df["url"] = user_df["url"].astype("string")
    user_df["username"] = user_df["username"].astype("string")

    processed_user_df = user_df.merge(movie_data, on=["movie_id", "url"])

    # Trains recommendation model on processed user data
    model, _, _, _, _ = train_model(processed_user_df)
    print(f"\ncreated {user}'s recommendation model")

    # Finds movies not seen by the user
    unseen = movie_data[
        ~movie_data["movie_id"].isin(processed_user_df["movie_id"])
    ].copy()
    unseen = unseen[~unseen["movie_id"].isin(unrated)]

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
    unseen = unseen[filter_mask]

    # Creates unseen feature data
    X_unseen = unseen.drop(columns=["movie_id", "title", "poster", "url"])
    X_unseen["is_movie"] = (X_unseen["content_type"] == "movie").astype(int)
    X_unseen.drop(columns=["content_type"], inplace=True)

    # Predicts user ratings for unseen movies
    if len(X_unseen) == 0:
        raise RecommendationFilterException(
            "No movies fit the selected filter criteria"
        )
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

    return {"username": user, "recommendations": recommendations.iloc[:n]}


async def recommend_n_watchlist_movies(
    user: str, n: int, watchlist_pool: Sequence[str]
) -> Dict[str, Any]:

    # Gets and processes movie data from the database
    movie_data = database.get_movie_data()

    # Gets and processes the user data
    try:
        async with aiohttp.ClientSession() as session:
            user_df, _ = await get_user_ratings(
                user, session, verbose=False, update_urls=True
            )
    except Exception as e:
        raise UserProfileException("User has not rated enough movies")

    user_df["movie_id"] = user_df["movie_id"].astype(int)
    user_df["url"] = user_df["url"].astype("string")
    user_df["username"] = user_df["username"].astype("string")

    processed_user_df = user_df.merge(movie_data, on=["movie_id", "url"])

    # Trains recommendation model on processed user data
    model, _, _, _, _ = train_model(processed_user_df)
    print(f"\ncreated {user}'s recommendation model")

    # Predicts user ratings for watchlist movies
    watchlist_pool = [
        url.replace("www.letterboxd.com/", "letterboxd.com/") for url in watchlist_pool
    ]
    watchlist_movies = movie_data[movie_data["url"].isin(watchlist_pool)].copy()

    X_watchlist = watchlist_movies.drop(columns=["movie_id", "title", "poster", "url"])
    X_watchlist["is_movie"] = (X_watchlist["content_type"] == "movie").astype(int)
    X_watchlist.drop(columns=["content_type"], inplace=True)

    if len(X_watchlist) == 0:
        raise WatchlistMoviesMissingException(
            "No movies fit the selected filter criteria"
        )
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

    return {"username": user, "recommendations": recommendations.iloc[:n]}


# Merges recommendations for multiple users
def merge_recommendations(
    n: int, all_recommendations: Sequence[Dict[str, Any]]
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

    return final_merged_recommendations.iloc[:n]
