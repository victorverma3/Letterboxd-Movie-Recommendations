# imports
import aiohttp
import numpy as np
import os
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import root_mean_squared_error
from sklearn.model_selection import cross_val_score, KFold, train_test_split
import sys
from typing import Sequence
from xgboost import XGBRegressor

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(project_root)

import data_processing.database as database
from data_processing.scrape_user_ratings import get_user_ratings
from data_processing.utility import (
    process_genres,
    RecommendationFilterException,
    UserProfileException,
    WatchlistMoviesMissingException,
)


# trains recommender model
def train_model(user_df, modelType="RF", verbose=False):

    # creates user feature data
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

    # creates user target data
    y = user_df["user_rating"]

    # creates train-test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=0
    )

    # creates test-validation split
    X_test, X_val, y_test, y_val = train_test_split(
        X_test, y_test, test_size=0.5, random_state=0
    )

    # initializes model
    if modelType == "XG":
        model = XGBRegressor(
            enable_categorical=True, n_estimators=200, max_depth=3, learning_rate=0.05
        )
    elif modelType == "RF":
        model = RandomForestRegressor(
            random_state=0, max_depth=10, min_samples_split=10, n_estimators=100
        )

    # performs k-fold cross-validation
    kf = KFold(n_splits=5, shuffle=True, random_state=0)
    cv_results = cross_val_score(
        model, X_train, y_train, cv=kf, scoring="neg_root_mean_squared_error"
    )
    rmse_cv = -cv_results.mean()

    # fits recommendation model on user training data
    model.fit(X_train, y_train)

    # calculates mse on test data
    y_pred_test = model.predict(X_test)
    rmse_test = root_mean_squared_error(y_test, y_pred_test)
    rounded_rmse_test = root_mean_squared_error(y_test, np.round(y_pred_test * 2) / 2)

    # calculates mse on validation data
    y_pred_val = model.predict(X_val)
    rmse_val = root_mean_squared_error(y_val, y_pred_val)
    rounded_rmse_val = root_mean_squared_error(y_val, np.round(y_pred_val * 2) / 2)

    # results_df = pd.DataFrame(
    #     {"actual_user_rating": y_val, "predicted_user_rating": y_pred_val.flatten()}
    # )

    # prints accuracy evaluation values
    if verbose:
        print("5-fold Cross Validation RMSE:", rmse_cv)
        print("Test RMSE:", rmse_test)
        print("Validation RMSE:", rmse_val)
        # print(results_df)

    return model, rmse_cv, rmse_test, rounded_rmse_test, rmse_val, rounded_rmse_val


# recommendations
async def recommend_n_movies(
    user,
    n,
    popularity,
    min_release_year,
    max_release_year,
    genres,
    min_runtime,
    max_runtime,
):

    # verifies parameters
    if n < 1:
        raise ValueError("number of recommendations must be an integer greater than 0")

    # gets and processes movie data from the database
    movie_data = database.get_movie_data()
    genre_columns = movie_data[["genres"]].apply(
        process_genres, axis=1, result_type="expand"
    )
    movie_data = pd.concat([movie_data, genre_columns], axis=1)
    movie_data["url"] = movie_data["url"].astype("string")
    movie_data["title"] = movie_data["title"].astype("string")
    movie_data["poster"] = movie_data["poster"].astype("string")

    # gets and processes the user data
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

    # trains recommendation model on processed user data
    model, _, _, _, _, _ = train_model(processed_user_df)
    print(f"\ncreated {user}'s recommendation model")

    # finds movies not seen by the user
    unseen = movie_data[
        ~movie_data["movie_id"].isin(processed_user_df["movie_id"])
    ].copy()
    unseen = unseen[~unseen["movie_id"].isin(unrated)]

    # adds popularity filter to mask
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
    filter_mask = unseen["letterboxd_rating_count"] >= threshold

    # adds release year filter to mask
    filter_mask &= (unseen["release_year"] >= min_release_year) & (
        unseen["release_year"] <= max_release_year
    )

    # adds genre filter to mask
    included_genres = [f"is_{genre}" for genre in genres]
    filter_mask &= unseen[included_genres].to_numpy().any(axis=1)

    # adds special genre filters to mask
    special_genre_filters = {
        "animation": "is_animation",
        "horror": "is_horror",
        "documentary": "is_documentary",
    }
    for genre, col in special_genre_filters.items():
        if genre not in genres:
            filter_mask &= unseen[col] == 0

    # adds release year filter to mask
    filter_mask &= (unseen["runtime"] >= min_runtime) & (
        unseen["runtime"] <= max_runtime
    )

    # applies all filters in mask
    unseen = unseen[filter_mask]

    # creates unseen feature data
    X_unseen = unseen.drop(columns=["movie_id", "title", "poster", "url"])

    # predicts user ratings for unseen movies
    if len(X_unseen) == 0:
        raise RecommendationFilterException(
            "No movies fit the selected filter criteria"
        )

    predicted_ratings = model.predict(X_unseen)

    # trims predicted ratings to acceptable range
    unseen["predicted_rating"] = np.clip(predicted_ratings, 0.5, 5).astype("float32")

    # rounds predicted ratings to 2 decimals
    unseen["predicted_rating"] = unseen["predicted_rating"].apply(
        lambda x: "{:.2f}".format(round(x, 2))
    )

    # sorts recommendations from highest to lowest predicted rating
    recommendations = unseen.sort_values(by="predicted_rating", ascending=False)[
        ["title", "poster", "release_year", "predicted_rating", "url"]
    ].drop_duplicates(subset="url")

    return {"username": user, "recommendations": recommendations.iloc[:n]}


async def recommend_n_watchlist_movies(
    user: str, n: int, watchlist_pool: Sequence[str]
):

    # gets and processes movie data from the database
    movie_data = database.get_movie_data()
    genre_columns = movie_data[["genres"]].apply(
        process_genres, axis=1, result_type="expand"
    )
    movie_data = pd.concat([movie_data, genre_columns], axis=1)
    movie_data["url"] = movie_data["url"].astype("string")
    movie_data["title"] = movie_data["title"].astype("string")
    movie_data["poster"] = movie_data["poster"].astype("string")

    # gets and processes the user data
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

    # trains recommendation model on processed user data
    model, _, _, _, _, _ = train_model(processed_user_df)
    print(f"\ncreated {user}'s recommendation model")

    # predicts user ratings for watchlist movies
    watchlist_pool = [
        url.replace("www.letterboxd.com/", "letterboxd.com//") for url in watchlist_pool
    ]
    watchlist_movies = movie_data[movie_data["url"].isin(watchlist_pool)].copy()

    X_watchlist = watchlist_movies.drop(columns=["movie_id", "title", "poster", "url"])

    if len(X_watchlist) == 0:
        raise WatchlistMoviesMissingException(
            "No movies fit the selected filter criteria"
        )

    predicted_ratings = model.predict(X_watchlist)

    # trims predicted ratings to acceptable range
    watchlist_movies["predicted_rating"] = np.clip(predicted_ratings, 0.5, 5).astype(
        "float32"
    )

    # rounds predicted ratings to 2 decimals
    watchlist_movies["predicted_rating"] = watchlist_movies["predicted_rating"].apply(
        lambda x: "{:.2f}".format(round(x, 2))
    )

    # sorts recommendations from highest to lowest predicted rating
    recommendations = watchlist_movies.sort_values(
        by="predicted_rating", ascending=False
    )[["title", "poster", "release_year", "predicted_rating", "url"]].drop_duplicates(
        subset="url"
    )

    return {"username": user, "recommendations": recommendations.iloc[:n]}


# merges recommendations for multiple users
def merge_recommendations(n, all_recommendations):

    # renames predicted rating columns to be unique
    for item in all_recommendations:
        item["recommendations"].rename(
            columns={"predicted_rating": f'{item["username"]}_predicted_rating'},
            inplace=True,
        )
        item["recommendations"][f'{item["username"]}_predicted_rating'] = item[
            "recommendations"
        ][f'{item["username"]}_predicted_rating'].astype("float32")

    # merges dataframes to only include movies recommended for all users
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

    # calculates average predicted rating
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

    # sorts recommendations from highest to lowest predicted average rating
    final_merged_recommendations = merged_recommendations.sort_values(
        by="predicted_rating", ascending=False
    )[["title", "poster", "release_year", "predicted_rating", "url"]].drop_duplicates(
        subset="url"
    )

    return final_merged_recommendations.iloc[:n]
