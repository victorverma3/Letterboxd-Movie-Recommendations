import os
import sys
import time

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(project_root)

from data_processing import database

if __name__ == "__main__":

    start = time.perf_counter()

    # Loads user ratings
    user_ratings = database.get_user_ratings()

    # Updates user ratings
    user_ratings.to_csv("../data/training/user_ratings.csv", index=False)

    finish = time.perf_counter()
    print(f"Updated user ratings in {finish - start} seconds")
