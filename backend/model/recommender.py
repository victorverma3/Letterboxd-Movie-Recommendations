# imports
import os
import sys

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(project_root)
import aiohttp
import data_processing.database as database
from data_processing.scrape_user_ratings import get_user_ratings
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error
from sklearn.model_selection import cross_val_score, KFold, train_test_split
from xgboost import XGBRegressor

# global
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


# processes data
def create_genre_columns(row):

    # performs one-hot encoding for genres
    genres = [genre.lower().replace(" ", "_") for genre in row["genres"]]

    for genre in genre_options:
        row[f"is_{genre}"] = 1 if genre in genres else 0

    return row


def assign_countries(row):

    # maps countries to numerical values
    country_map = {
        "USA": 0,
        "UK": 1,
        "China": 2,
        "France": 3,
        "Japan": 4,
        "Germany": 5,
        "South Korea": 6,
        "Canada": 7,
        "India": 8,
        "Austrailia": 9,
        "Hong Kong": 10,
        "Italy": 11,
        "Spain": 12,
        "Brazil": 13,
        "USSR": 14,
    }

    row["country_of_origin"] = (
        country_map[row["country_of_origin"]]
        if row["country_of_origin"] in country_map
        else len(country_map)
    )

    return row


def process(df):

    # creates boolean features for each genre
    df = df.apply(create_genre_columns, axis=1)

    # maps popular countries to numerical values
    df = df.apply(assign_countries, axis=1)

    # drops unnecessary features
    df.drop(columns=["genres"], inplace=True)

    return df


# trains recommender model
def train_model(user_df, modelType="RF", verbose=False):

    # creates user feature data
    X = user_df.drop(columns=["title", "user_rating", "liked", "url", "username"])

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
        model, X_train, y_train, cv=kf, scoring="neg_mean_squared_error"
    )
    mse_cv = -cv_results.mean()

    # fits recommendation model on user training data
    model.fit(X_train, y_train)

    # calculates mse on test data
    y_pred_test = model.predict(X_test)
    mse_test = mean_squared_error(y_test, y_pred_test)

    # calculates mse on validation data
    y_pred_val = model.predict(X_val)
    mse_val = mean_squared_error(y_val, y_pred_val)

    results_df = pd.DataFrame(
        {"actual_user_rating": y_val, "predicted_user_rating": y_pred_val.flatten()}
    )

    # prints accuracy evaluation values
    if verbose:
        print("Mean Squared Error with 5-fold Cross Validation:", mse_cv)
        print("Mean Squared Error on Test Set:", mse_test)
        print("Mean Squared Error on Validation Set:", mse_val)
        print(results_df)

    return model, mse_cv, mse_test, mse_val


# recommendations
async def recommend_n_movies(user, n, popularity, release_year, genres, runtime):

    # verifies parameters
    if n < 1:
        raise ValueError("number of recommendations must be an integer greater than -")

    # gets and processes all movie data
    movie_data = database.get_movie_data()
    movie_data["title"] = movie_data["title"].astype("string")
    movie_data["url"] = movie_data["url"].astype("string")

    # gets and processes the user data
    try:
        async with aiohttp.ClientSession() as session:
            user_df, unrated = await get_user_ratings(
                user, session, verbose=False, update_urls=True
            )
        user_df["movie_id"] = user_df["movie_id"].astype("int")
        user_df["url"] = user_df["url"].astype("string")
        user_df["username"] = user_df["username"].astype("string")
    except ValueError as e:
        raise e

    processed_user_df = user_df.merge(movie_data, how="left", on=["movie_id", "url"])

    # trains recommendation model on processed user data
    model, _, _, _ = train_model(processed_user_df)
    print(f"\ncreated {user}'s recommendation model")

    # finds movies not seen by the user
    unseen = movie_data[
        ~movie_data["movie_id"].isin(processed_user_df["movie_id"])
    ].copy()
    unseen = unseen[~unseen["movie_id"].isin(unrated)]

    # creates unseen feature data
    X_unseen = unseen.drop(columns=["title", "url"])

    # predicts user ratings for unseen movies
    predicted_ratings = model.predict(X_unseen)

    # trims predicted ratings to acceptable range
    unseen["predicted_rating"] = np.clip(predicted_ratings, 0.5, 5)

    # rounds predicted ratings to 2 decimals
    unseen["predicted_rating"] = unseen["predicted_rating"].apply(
        lambda x: "{:.2f}".format(round(x, 2))
    )

    # applies popularity filter
    popularity_map = {
        0: 1,
        1: 0.7,
        2: 0.4,
        3: 0.2,
        4: 0.1,
        5: 0.05,
    }
    recommendations = unseen.sort_values(by="letterboxd_rating_count", ascending=False)
    recommendations = recommendations.iloc[
        : int(popularity_map[popularity] * len(recommendations))
    ]

    # applies release year filter
    recommendations = recommendations[recommendations["release_year"] >= release_year]

    # applies genre filter
    included_genres = [f"is_{genre}" for genre in genres]
    recommendations = recommendations[
        recommendations[included_genres].eq(1).any(axis=1)
    ]

    # special filter for animation
    if "animation" not in genres:
        recommendations = recommendations[recommendations["is_animation"] == 0]

    # special filter for horror
    if "horror" not in genres:
        recommendations = recommendations[recommendations["is_horror"] == 0]

    # special filter for documentaries
    if "documentary" not in genres:
        recommendations = recommendations[recommendations["is_documentary"] == 0]

    # applies runtime filter
    if runtime != -1:
        recommendations = recommendations[recommendations["runtime"] <= runtime]

    # sorts recommendations from highest to lowest predicted rating
    final_recommendations = recommendations.sort_values(
        by="predicted_rating", ascending=False
    )[["title", "release_year", "predicted_rating", "url"]].drop_duplicates(
        subset="url"
    )

    return {"username": user, "recommendations": final_recommendations.iloc[:n]}


def merge_recommendations(n, all_recommendations):

    # renames predicted rating columns to be unique
    for item in all_recommendations:
        item["recommendations"].rename(
            columns={"predicted_rating": f'{item["username"]}_predicted_rating'},
            inplace=True,
        )

    # merges dataframes to only include movies recommended for all users
    dataframes = [item["recommendations"] for item in all_recommendations]
    merged_recommendations = dataframes[0]

    for df in dataframes[1:]:
        merged_recommendations = pd.merge(
            merged_recommendations, df, on=["title", "release_year", "url"], how="inner"
        )

    # calculates average predicted rating
    predicted_rating_columns = [
        col
        for col in merged_recommendations.columns
        if col.endswith("_predicted_rating")
    ]

    merged_recommendations["average_predicted_rating"] = (
        merged_recommendations[predicted_rating_columns]
        .astype(float)
        .mean(axis=1)
        .round(2)
    )

    # rounds average predicted ratings to 2 decimals
    merged_recommendations["average_predicted_rating"] = merged_recommendations[
        "average_predicted_rating"
    ].apply(lambda x: "{:.2f}".format(x))

    # sorts recommendations from highest to lowest predicted average rating
    final_merged_recommendations = merged_recommendations.sort_values(
        by="average_predicted_rating", ascending=False
    )[["title", "release_year", "average_predicted_rating", "url"]].drop_duplicates(
        subset="url"
    )

    return final_merged_recommendations.iloc[:n]
