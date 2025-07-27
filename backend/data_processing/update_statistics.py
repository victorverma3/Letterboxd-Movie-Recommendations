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
from data_processing.utils import get_user_dataframe


async def statistics_update() -> None:
    """
    Updates all user statistics.
    """

    start = time.perf_counter()

    # Gets statistics users from database
    try:
        statistics_users = database.get_statistics_user_list()
    except Exception as e:
        print("Failed to get statistics users")
        raise e

    # Gets movie data from database
    try:
        movie_data = database.get_movie_data()
    except Exception as e:
        print("Failed to get movie data")
        raise e

    # Gets all updated user statistics
    batch_size = 20
    batches = [
        statistics_users[i : i + batch_size]
        for i in range(0, len(statistics_users), batch_size)
    ]
    all_stats = {}
    for batch in batches:
        tasks = [
            process_user_statistics_update(user=user, movie_data=movie_data)
            for user in batch
        ]
        results = await asyncio.gather(*tasks)
        all_stats.update({user: stats for user, stats in results if stats is not None})

    # Updates user statistics in database
    try:
        database.update_many_user_statistics(all_stats=all_stats, batch_size=100)
        print(f"Successfully updated user statistics in database")
    except:
        print(f"Failed to update user statistics in database")

    finish = time.perf_counter()
    print(f"Updated statistics in {finish - start} seconds")


async def process_user_statistics_update(
    user: str, movie_data: pd.DataFrame
) -> Tuple[str, Any]:
    """
    Gets updated user stats.
    """

    try:
        user_df = await get_user_dataframe(
            user=user, movie_data=movie_data, update_urls=False
        )
        user_stats = await get_user_statistics(user_df=user_df)
        print(f"Successfully calculated {user}'s statistics")

        return user, user_stats
    except:
        print(f"Failed to get {user}'s statistics")

        return user, None


if __name__ == "__main__":

    asyncio.run(statistics_update())
