# imports
import os
import sys

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(project_root)
import asyncio
from data_processing.calculate_user_statistics import get_user_statistics
import data_processing.database as database
from data_processing.utility import get_user_dataframe
import time


async def statistics_update():

    start = time.perf_counter()

    # gets statistics users from database
    try:
        statistics_users = database.get_statistics_user_log()
    except Exception as e:
        print("\nfailed to get statistics users")
        raise e

    # gets movie data from database
    try:
        movie_data = database.get_movie_data()
    except Exception as e:
        print("\nfailed to get movie data")
        raise e

    # gets all updated user statistics
    all_stats = {}
    for user in statistics_users:
        try:
            user_df = await get_user_dataframe(user, movie_data)
            all_stats[user] = get_user_statistics(user_df)
            print(f"\nsuccessfully calculated {user}'s statistics")
        except:
            print(f"\nfailed to get {user}'s statistics")

    # updates user data in database
    try:
        database.update_many_user_statistics(all_stats)
        print(f"\nsuccessfully updated all user statistics in database")
    except:
        print(f"\nfailed to update all user statistics in database")

    finish = time.perf_counter()
    print(f"\nupdated statistics in {finish - start} seconds")


if __name__ == "__main__":
    asyncio.run(statistics_update())
