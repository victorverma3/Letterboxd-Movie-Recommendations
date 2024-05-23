# Imports
import aiohttp
import asyncio
from bs4 import BeautifulSoup
from itertools import chain
import random
from data_processing.utility import CommonWatchlistError

# Setup
errors = []


# gets picks from watchlists
async def get_user_watchlist_picks(user_list, overlap, num_picks):

    # asynchronously scrapes the user watchlists
    async def fetch_watchlist(user, session):
        print(f"\nscraping {user}'s watchlist...")
        watchlist = await get_watchlist(user, session)
        return watchlist

    watchlists = []
    async with aiohttp.ClientSession() as session:
        tasks = [fetch_watchlist(user, session) for user in user_list]
        watchlists = await asyncio.gather(*tasks)

    # picks from overlapping movies across watchlists
    if overlap == "y":

        # finds common watchlist
        watchlist_sets = [
            set(frozenset(movie.items()) for movie in watchlist)
            for watchlist in watchlists
        ]
        common_watchlist_sets = set.intersection(*watchlist_sets)
        common_watchlist = [dict(movie) for movie in common_watchlist_sets]

        # checks if overlap exists
        if len(common_watchlist) == 0:
            raise CommonWatchlistError("no movies in common across all watchlists")

        common_watchlist = list(common_watchlist)

        # randomly picks movies from commom watchlist
        while num_picks > 0:
            try:
                picks = random.sample(common_watchlist, num_picks)
                break
            except ValueError:
                print("not enough movies in common across all watchlists...")
                num_picks -= 1
                print(f"trying {num_picks} picks instead...")

    # picks from watchlist regardless of overlap
    elif overlap == "n":
        all_watchlists = list(chain(*watchlists))
        while num_picks > 0:
            try:
                picks = random.sample(all_watchlists, num_picks)
                break
            except ValueError:
                print("not enough movies across all watchlists...")
                num_picks -= 1
                print(f"trying {num_picks} picks instead...")

    return picks


async def get_watchlist(user, session=None):

    # scrapes a single watchlist page
    async def fetch_watchlist_page(page_number):
        async with session.get(
            f"https://letterboxd.com/{user}/watchlist/page/{page_number}"
        ) as page:
            soup = BeautifulSoup(await page.text(), "html.parser")
            movies = soup.select("li.poster-container")
            return [get_data(movie) for movie in movies]

    watchlist = []
    page_number = 1

    while True:
        data = await fetch_watchlist_page(page_number)
        if not data:  # stops loop on empty page
            break

        # extends watchlist with next page data
        watchlist.extend(await asyncio.gather(*data))
        page_number += 1

    if not watchlist:
        raise Exception(f"{user}'s watchlist was empty. Please check the username.")

    return watchlist


async def get_data(movie):

    if not movie:
        return None

    title = movie.div.img.get("alt")  # gets movie title
    url = movie.div.get("data-target-link")  # gets Letterboxd URL

    return {"title": title, "url": f"https://www.letterboxd.com{url}"}


async def main():

    picks = await get_user_watchlist_picks(["victorverma"], "n", 5)

    return picks


if __name__ == "__main__":
    print(asyncio.run(main()))
