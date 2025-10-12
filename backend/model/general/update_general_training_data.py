import argparse
import os
import pandas as pd
import sys
import time

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
sys.path.append(project_root)

from data_processing import database
from data_processing.utils import GENRES


def prepare_general_training_data(
    user_ratings: pd.DataFrame, movie_data: pd.DataFrame, verbose: bool = False
) -> pd.DataFrame:
    """
    Prepares general training data.
    """

    # Joins on movie_id
    general_df = pd.merge(
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
        general_df = general_df[columns].copy()
    except Exception as e:
        print("General dataframe is missing a feature")
        raise e

    # Creates is_movie feature
    general_df["is_movie"] = (general_df["content_type"] == "movie").astype("int8")
    general_df = general_df.drop(columns=["content_type"])

    if verbose:
        print("Created general training features")

    # Converts features to memory optimized types
    for genre in GENRES:
        general_df[f"is_{genre}"] = general_df[f"is_{genre}"].astype("int8")
    general_df["country_of_origin"] = general_df["country_of_origin"].astype("int8")
    general_df["release_year"] = general_df["release_year"].astype("int16")
    general_df["runtime"] = general_df["runtime"].astype("int16")
    general_df["letterboxd_rating_count"] = general_df[
        "letterboxd_rating_count"
    ].astype("int32")
    general_df["user_rating"] = general_df["user_rating"].astype("float32")
    general_df["letterboxd_rating"] = general_df["letterboxd_rating"].astype("float32")

    if verbose:
        print("Optimized feature dtypes")

    return general_df


if __name__ == "__main__":

    parser = argparse.ArgumentParser()

    # Month
    parser.add_argument(
        "-m",
        "--month",
        help="The month of the dataset.",
        choices=[
            "jan",
            "feb",
            "mar",
            "apr",
            "may",
            "jun",
            "jul",
            "aug",
            "sep",
            "oct",
            "nov",
            "dec",
        ],
        required=True,
    )

    # Year
    parser.add_argument(
        "-y",
        "--year",
        help="The year of the dataset.",
        required=True,
    )

    # Verbose
    parser.add_argument(
        "-v", "--verbose", help="The verbosity of the model.", action="store_true"
    )

    args = parser.parse_args()

    start = time.perf_counter()

    # Loads user ratings and movie data
    user_ratings = pd.read_csv(
        f"../../data/training/user_ratings_{args.month}_{args.year}.csv"
    )
    movie_data = database.get_movie_data()
    if args.verbose:
        print("Loaded user ratings and movie data")

    # Creates general training data
    general_training_data = prepare_general_training_data(
        user_ratings=user_ratings, movie_data=movie_data, verbose=args.verbose
    )
    if args.verbose:
        print("Created general training data")

    # Updates global training data
    general_training_data.to_csv(
        f"../../data/training/general/general_training_data_{args.month}_{args.year}.csv",
        index=False,
    )

    finish = time.perf_counter()
    print(f"Updated general training data in {finish - start} seconds")
