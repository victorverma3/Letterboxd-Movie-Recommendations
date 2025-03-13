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

from data_processing.utility import WatchlistEmptyException, WatchlistOverlapException
from model.recommender import merge_recommendations, recommend_n_watchlist_movies

# Setup
errors = []


# gets picks from watchlists
async def get_user_watchlist_picks(user_list, overlap, pick_type, num_picks):

    # asynchronously scrapes the user watchlists
    async def fetch_watchlist(user, session):
        print(f"\nScraping {user}'s watchlist...")
        watchlist = await get_watchlist(user, session)
        return watchlist

    watchlists = []
    async with aiohttp.ClientSession() as session:
        tasks = [fetch_watchlist(user, session) for user in user_list]
        watchlists = await asyncio.gather(*tasks)

    # creates appropriate watchlist pool
    if overlap == "y":
        # finds common watchlist
        watchlist_sets = [set(watchlist) for watchlist in watchlists]
        watchlist_pool = list(set.intersection(*watchlist_sets))

        # checks if overlap exists
        if len(watchlist_pool) == 0:
            raise WatchlistOverlapException("No movies in common across all watchlists")
    else:
        # forms union of watchlists
        watchlist_pool = list(chain(*watchlists))

    # randomly picks movies from watchlist pool
    if pick_type == "random":
        while num_picks > 0:
            try:
                picks = random.sample(watchlist_pool, num_picks)
                break
            except ValueError:
                print(f"Not enough movies in watchlist pool...")
                num_picks -= 1
                print(f"Trying {num_picks} picks instead...")

        async with aiohttp.ClientSession() as session:
            tasks = [get_letterboxd_data(url, session) for url in picks]
            watchlist_picks = await asyncio.gather(*tasks)

        watchlist_picks = [pick for pick in watchlist_picks if pick is not None]
    else:
        if len(user_list) == 1:
            watchlist_picks = await recommend_n_watchlist_movies(
                user_list[0], 100, watchlist_pool
            )
            watchlist_picks = json.loads(
                watchlist_picks["recommendations"].to_json(
                    orient="records", index=False
                )
            )
        else:
            tasks = [
                recommend_n_watchlist_movies(username, 100, watchlist_pool)
                for username in user_list
            ]
            all_recommendations = await asyncio.gather(*tasks)

            # merges recommendations
            watchlist_picks = merge_recommendations(100, all_recommendations)
            watchlist_picks = json.loads(
                watchlist_picks.to_json(orient="records", index=False)
            )

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
        raise WatchlistEmptyException(f"{user}'s watchlist was empty")

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
