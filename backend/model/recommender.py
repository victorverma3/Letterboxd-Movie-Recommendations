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


from data_processing.utils import (
    GENRES,
    get_processed_user_df,
    RecommendationFilterException,
    WatchlistMoviesMissingException,
)


# Prepares features for recommendation model
def prepare_features(X: pd.DataFrame) -> pd.DataFrame:

    feature_columns = [
        "release_year",
        "runtime",
        "country_of_origin",
        "content_type",
        "letterboxd_rating",
        "letterboxd_rating_count",
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
    ]

    # Keeps feature columns
    try:
        X = X[feature_columns].copy()
    except Exception as e:
        print("X is missing a feature")
        raise e

    # Creates is_movie feature
    X["is_movie"] = (X["content_type"] == "movie").astype("int8")
    X = X.drop(columns=["content_type"])

    # Converts features to memory optimized types
    for genre in GENRES:
        X[f"is_{genre}"] = X[f"is_{genre}"].astype("int8")
    X["country_of_origin"] = X["country_of_origin"].astype("int8")
    X["release_year"] = X["release_year"].astype("int16")
    X["runtime"] = X["runtime"].astype("int16")
    X["letterboxd_rating_count"] = X["letterboxd_rating_count"].astype("int32")
    X["letterboxd_rating"] = X["letterboxd_rating"].astype("float32")

    return X


# Trains recommendation model
def train_model(
    user_df: pd.DataFrame, modelType: Literal["RF", "XG"] = "RF", verbose: bool = False
) -> Tuple[XGBRegressor | RandomForestRegressor, float, float, float, float]:

    # Prepares user feature data
    X = prepare_features(X=user_df)

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

    # Loads processed user df, unrated movies, and movie data
    processed_user_df, unrated, movie_data = await get_processed_user_df(user=user)

    # Trains recommendation model on processed user data
    model, _, _, _, _ = train_model(user_df=processed_user_df)
    print(f"\ncreated {user}'s recommendation model")

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
    X_unseen = prepare_features(X=unseen)

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

    return {"username": user, "recommendations": recommendations.iloc[:n]}


async def recommend_n_watchlist_movies(
    user: str, n: int, watchlist_pool: Sequence[str]
) -> Dict[str, Any]:

    # Loads processed user df and movie data
    processed_user_df, _, movie_data = await get_processed_user_df(user=user)

    # Trains recommendation model on processed user data
    model, _, _, _, _ = train_model(user_df=processed_user_df)
    print(f"\ncreated {user}'s recommendation model")

    # Collects movies on watchlist
    watchlist_pool = [
        url.replace("https://www.letterboxd.com", "") for url in watchlist_pool
    ]
    watchlist_movies = movie_data[movie_data["url"].isin(watchlist_pool)].copy()

    if len(watchlist_movies) == 0:
        raise WatchlistMoviesMissingException(f"No movies on {user}'s watchlist")

    # Prepares watchlist feature data
    X_watchlist = prepare_features(X=watchlist_movies)

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
