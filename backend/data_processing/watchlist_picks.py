# Imports
import aiohttp
import asyncio
from bs4 import BeautifulSoup
from itertools import chain
import json
import os
import random
import sys


project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(project_root)

from data_processing.utility import CommonWatchlistError

# Setup
errors = []


# gets picks from watchlists
async def get_user_watchlist_picks(user_list, overlap, num_picks):

    # asynchronously scrapes the user watchlists
    async def fetch_watchlist(user, session):
        print(f"\nScraping {user}'s watchlist...")
        watchlist = await get_watchlist(user, session)
        return watchlist

    watchlists = []
    async with aiohttp.ClientSession() as session:
        tasks = [fetch_watchlist(user, session) for user in user_list]
        watchlists = await asyncio.gather(*tasks)

    # picks from overlapping movies across watchlists
    if overlap == "y":

        # finds common watchlist
        watchlist_sets = [set(watchlist) for watchlist in watchlists]
        common_watchlist = list(set.intersection(*watchlist_sets))

        # checks if overlap exists
        if len(common_watchlist) == 0:
            raise CommonWatchlistError("No movies in common across all watchlists")

        # randomly picks movies from commom watchlist
        while num_picks > 0:
            try:
                picks = random.sample(common_watchlist, num_picks)
                break
            except ValueError:
                print("Not enough movies in common across all watchlists...")
                num_picks -= 1
                print(f"Trying {num_picks} picks instead...")

    # picks from watchlist regardless of overlap
    elif overlap == "n":
        all_watchlists = list(chain(*watchlists))
        while num_picks > 0:
            try:
                picks = random.sample(all_watchlists, num_picks)
                break
            except ValueError:
                print("Not enough movies across all watchlists...")
                num_picks -= 1
                print(f"Trying {num_picks} picks instead...")

    async with aiohttp.ClientSession() as session:
        tasks = [get_letterboxd_data(url, session) for url in picks]
        watchlist_picks = await asyncio.gather(*tasks)

    watchlist_picks = [pick for pick in watchlist_picks if pick is not None]

    return watchlist_picks


# gets user watchlist
async def get_watchlist(user, session=None):

    # scrapes a single watchlist page
    async def fetch_watchlist_page(page_number):
        async with session.get(
            f"https://letterboxd.com/{user}/watchlist/page/{page_number}"
        ) as page:
            soup = BeautifulSoup(await page.text(), "html.parser")
            movies = soup.select("li.poster-container")
            return [get_url(movie) for movie in movies]

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


# gets movie url
async def get_url(movie):

    if not movie:
        return None

    url = movie.div.get("data-target-link")  # gets Letterboxd URL

    return f"https://www.letterboxd.com{url}"


# gets Letterboxd data
async def get_letterboxd_data(url, session):

    # scrapes relevant Letterboxd data from each page if possible
    try:
        async with session.get(url, timeout=60) as response:
            if response.status != 200:
                print(f"Failed to fetch {url}, status code: {response.status}")
                return None

            soup = BeautifulSoup(await response.text(), "html.parser")
            script = str(soup.find("script", {"type": "application/ld+json"}))
            script = script[52:-20]  # trimmed to useful json data
            try:
                webData = json.loads(script)
            except:
                print(f"Error while scraping {title}")
                return None

            try:
                title = webData["name"]  # title
                release_year = int(
                    webData["releasedEvent"][0]["startDate"]
                )  # release year
                poster = webData["image"]  # poster
            except:
                # catches movies with missing data
                print(f"Failed to scrape {title} - missing data")
                return None

            return {
                "url": url,
                "title": title,
                "release_year": release_year,
                "poster": poster,
            }
    except:
        print(f"Failed to scrape {title} - timed out")


async def main():

    watchlist_picks = await get_user_watchlist_picks(["victorverma"], "y", 5)

    return watchlist_picks


if __name__ == "__main__":
    print(asyncio.run(main()))
