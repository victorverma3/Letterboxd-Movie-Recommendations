import argparse
import os
import pandas as pd
import sys
import time

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
sys.path.append(project_root)

from data_processing import database
from data_processing.utils import GENRES


def prepare_global_features(
    user_ratings: pd.DataFrame, movie_data: pd.DataFrame, verbose: bool = False
) -> pd.DataFrame:

    # Joins on movie_id
    global_df = pd.merge(
        left=user_ratings, right=movie_data, on="movie_id", how="inner"
    )

    columns = [
        "user_rating",
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
        global_df = global_df[columns].copy()
    except Exception as e:
        print("Global dataframe is missing a feature")
        raise e

    # Creates is_movie feature
    global_df["is_movie"] = (global_df["content_type"] == "movie").astype("int8")
    global_df = global_df.drop(columns=["content_type"])

    if verbose:
        print("Created global training features")

    # Converts features to memory optimized types
    for genre in GENRES:
        global_df[f"is_{genre}"] = global_df[f"is_{genre}"].astype("int8")
    global_df["country_of_origin"] = global_df["country_of_origin"].astype("int8")
    global_df["release_year"] = global_df["release_year"].astype("int16")
    global_df["runtime"] = global_df["runtime"].astype("int16")
    global_df["letterboxd_rating_count"] = global_df["letterboxd_rating_count"].astype(
        "int32"
    )
    global_df["user_rating"] = global_df["user_rating"].astype("float32")
    global_df["letterboxd_rating"] = global_df["letterboxd_rating"].astype("float32")

    if verbose:
        print("Optimized feature dtypes")

    return global_df


if __name__ == "__main__":

    parser = argparse.ArgumentParser()

    # Verbose
    parser.add_argument(
        "-v", "--verbose", help="The verbosity of the model.", action="store_true"
    )

    args = parser.parse_args()

    start = time.perf_counter()

    # Loads user ratings and movie data
    user_ratings = pd.read_csv("../../data/training/user_ratings.csv")
    movie_data = database.get_movie_data()
    if args.verbose:
        print("Loaded user ratings and movie data")

    # Creates global training data
    global_training_data = prepare_global_training_data(
        user_ratings=user_ratings, movie_data=movie_data, verbose=args.verbose
    )
    if args.verbose:
        print("Created global training data")

    # Updates global training data
    global_training_data.to_csv(
        "../../data/training/global/global_training_data.csv", index=False
    )

    finish = time.perf_counter()
    print(f"Updated global training data in {finish - start} seconds")
