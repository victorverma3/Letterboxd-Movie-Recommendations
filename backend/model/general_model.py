import os
import pandas as pd
import pickle
from sklearn.ensemble import RandomForestRegressor
import sys

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(project_root)

from data_processing.utils import GENRES


# Prepares features for general model
def prepare_general_features(X: pd.DataFrame) -> pd.DataFrame:

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
        print("General dataframe is missing a feature")
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


# Loads general model
def load_general_model(
    load_path: str = "./model/models/general_rf_model.pkl",
) -> RandomForestRegressor:

    try:
        with open(load_path, "rb") as f:
            model = pickle.load(f)

        return model
    except:
        raise ValueError("General model path is invalid")
