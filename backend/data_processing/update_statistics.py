# imports
import asyncio
import os
import sys
import time

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(project_root)

from data_processing.calculate_user_statistics import get_user_statistics
import data_processing.database as database
from data_processing.utility import get_user_dataframe


# updates all user statistics
async def statistics_update():

    start = time.perf_counter()

    # gets statistics users from database
    try:
        statistics_users = database.get_statistics_user_log()
    except Exception as e:
        print("\nFailed to get statistics users")
        raise e

    # gets movie data from database
    try:
        movie_data = database.get_movie_data()
    except Exception as e:
        print("\nFailed to get movie data")
        raise e

    # gets all updated user statistics
    batch_size = 20
    batches = [
        statistics_users[i : i + batch_size]
        for i in range(0, len(statistics_users), batch_size)
    ]
    results = []
    for batch in batches:
        tasks = [process_user_statistics_update(user, movie_data) for user in batch]
        results.extend(await asyncio.gather(*tasks))
    all_stats = {user: stats for user, stats in results if stats is not None}

    # updates user statistics in database
    try:
        database.update_many_user_statistics(all_stats, batch_size=50)
        print(f"\nSuccessfully updated user statistics in database")
    except:
        print(f"\nFailed to update user statistics in database")

    finish = time.perf_counter()
    print(f"\nUpdated statistics in {finish - start} seconds")


# gets updated user stats
async def process_user_statistics_update(user, movie_data):

    try:
        user_df = await get_user_dataframe(user, movie_data, update_urls=False)
        user_stats = await get_user_statistics(user_df)
        print(f"\nSuccessfully calculated {user}'s statistics")
        return user, user_stats
    except:
        print(f"\nFailed to get {user}'s statistics")
        return user, None


if __name__ == "__main__":
    asyncio.run(statistics_update())
