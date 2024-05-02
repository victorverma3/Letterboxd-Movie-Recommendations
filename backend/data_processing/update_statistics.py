import os
import sys

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(project_root)
import asyncio
from data_processing.calculate_user_statistics import get_user_statistics
import data_processing.database as database
from data_processing.utility import get_user_dataframe
import time


# updates user statistics
async def statistics_update():

    start = time.perf_counter()

    statistics_users = database.get_statistics_user_log()
    print(statistics_users)
    tasks = [asyncio.create_task(process_user(user)) for user in statistics_users]
    await asyncio.gather(*tasks)

    finish = time.perf_counter()
    print(f"\nupdated statistics in {finish - start} seconds")


# updates an individual user's statistics
async def process_user(user):
    user_df = await get_user_dataframe(user)
    await get_user_statistics(user, user_df)


if __name__ == "__main__":
    asyncio.run(statistics_update())
