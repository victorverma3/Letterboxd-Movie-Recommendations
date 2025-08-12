import argparse
import os
import sys
import time

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(project_root)

from data_processing import database

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

    args = parser.parse_args()

    start = time.perf_counter()

    # Loads user ratings
    user_ratings = database.get_user_ratings()

    # Updates user ratings
    user_ratings.to_csv(
        f"../data/training/user_ratings_{args.month}_{args.year}.csv", index=False
    )

    finish = time.perf_counter()
    print(f"Updated user ratings in {finish - start} seconds")
