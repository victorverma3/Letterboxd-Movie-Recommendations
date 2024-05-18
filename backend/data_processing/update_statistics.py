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

    try:
        # gets statistics users from database
        statistics_users = database.get_statistics_user_log()
    except Exception as e:
        print(f"\nfailed to get statistics users")
        raise e

    # updates user statistics in database
    for user in statistics_users:
        try:
            user_df = await get_user_dataframe(user)
            await get_user_statistics(user, user_df)
        except:
            print(f"\nfailed to update {user}'s statistics")

    finish = time.perf_counter()
    print(f"\nupdated statistics in {finish - start} seconds")


if __name__ == "__main__":
    asyncio.run(statistics_update())
