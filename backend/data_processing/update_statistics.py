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


# updates all user statistics
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
    tasks = [
        process_user_statistics_update(user, movie_data) for user in statistics_users
    ]
    results = await asyncio.gather(*tasks)
    all_stats = {user: stats for user, stats in results if stats is not None}

    # updates user statistics in database
    try:
        database.update_many_user_statistics(all_stats, batch_size=50)
        print(f"\nsuccessfully updated user statistics in database")
    except:
        print(f"\nfailed to update user statistics in database")

    finish = time.perf_counter()
    print(f"\nupdated statistics in {finish - start} seconds")


# gets updated user stats
async def process_user_statistics_update(user, movie_data):
    try:
        user_df = await get_user_dataframe(user, movie_data, update_urls=False)
        user_stats = await get_user_statistics(user_df)
        print(f"\nsuccessfully calculated {user}'s statistics")
        return user, user_stats
    except:
        print(f"\nfailed to get {user}'s statistics")
        return user, None


if __name__ == "__main__":
    asyncio.run(statistics_update())
