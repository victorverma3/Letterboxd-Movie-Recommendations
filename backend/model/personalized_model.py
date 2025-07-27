import numpy as np
import os
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import root_mean_squared_error
from sklearn.model_selection import train_test_split
import sys
from typing import Tuple

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(project_root)

from data_processing.utils import GENRES


def prepare_personalized_features(X: pd.DataFrame) -> pd.DataFrame:
    """
    Prepares features for personalized model.
    """

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


def train_personalized_model(
    user_df: pd.DataFrame, verbose: bool = False
) -> Tuple[RandomForestRegressor, float, float, float, float]:
    """
    Trains personalized model.
    """

    # Prepares user feature data
    X = prepare_personalized_features(X=user_df)

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

    # Initializes personalized model
    model = RandomForestRegressor(
        random_state=0, max_depth=10, min_samples_split=10, n_estimators=100
    )

    # Fits personalized model on user training data
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
