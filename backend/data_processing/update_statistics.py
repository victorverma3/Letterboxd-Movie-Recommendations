import asyncio
import os
import pandas as pd
import sys
import time
from typing import Any, Tuple

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(project_root)

from data_processing.calculate_user_statistics import get_user_statistics
import data_processing.database as database
from data_processing.utility import get_user_dataframe


# Updates all user statistics
async def statistics_update():

    start = time.perf_counter()

    # Gets statistics users from database
    try:
        statistics_users = database.get_statistics_user_list()
    except Exception as e:
        print("\nFailed to get statistics users")
        raise e

    # Gets movie data from database
    try:
        movie_data = database.get_movie_data()
    except Exception as e:
        print("\nFailed to get movie data")
        raise e

    # Gets all updated user statistics
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

    # Updates user statistics in database
    try:
        database.update_many_user_statistics(all_stats, batch_size=50)
        print(f"\nSuccessfully updated user statistics in database")
    except:
        print(f"\nFailed to update user statistics in database")

    finish = time.perf_counter()
    print(f"\nUpdated statistics in {finish - start} seconds")


# Gets updated user stats
async def process_user_statistics_update(
    user: str, movie_data: pd.DataFrame
) -> Tuple[str, Any]:

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
