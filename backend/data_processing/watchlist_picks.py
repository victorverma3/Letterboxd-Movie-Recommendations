import aiohttp
import asyncio
from bs4 import BeautifulSoup, Tag
from itertools import chain
import json
import os
import random
import sys
from typing import Any, Dict, Literal, Sequence

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(project_root)

from data_processing.utils import (
    WatchlistEmptyException,
    WatchlistOverlapException,
)
from model.recommender import merge_recommendations, recommend_n_watchlist_movies


# Gets picks from watchlists
async def get_user_watchlist_picks(
    user_list: Sequence[str],
    overlap: Literal["y", "n"],
    pick_type: Literal["random", "recommendation"],
    num_picks: int,
) -> Sequence[Dict[str, Any]]:

    # Asynchronously scrapes the user watchlists
    async def fetch_watchlist(
        user: str, session: aiohttp.ClientSession
    ) -> Sequence[str]:
        print(f"\nScraping {user}'s watchlist...")
        watchlist = await get_watchlist(user, session)

        return watchlist

    watchlists = []
    async with aiohttp.ClientSession() as session:
        tasks = [fetch_watchlist(user, session) for user in user_list]
        watchlists = await asyncio.gather(*tasks)

    # Creates appropriate watchlist pool
    if overlap == "y":
        # Finds common watchlist
        watchlist_sets = [set(watchlist) for watchlist in watchlists]
        watchlist_pool = list(set.intersection(*watchlist_sets))

        # Checks if overlap exists
        if len(watchlist_pool) == 0:
            raise WatchlistOverlapException("No movies in common across all watchlists")
    else:
        # Forms union of watchlists
        watchlist_pool = list(chain(*watchlists))

    # Randomly picks movies from watchlist pool
    if pick_type == "random":
        num_picks = min(num_picks, len(watchlist_pool))
        picks = random.sample(watchlist_pool, num_picks) if watchlist_pool else []

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

            # Merges recommendations
            watchlist_picks = merge_recommendations(100, all_recommendations)
            watchlist_picks = json.loads(
                watchlist_picks.to_json(orient="records", index=False)
            )

    return watchlist_picks


# Gets user watchlist
async def get_watchlist(
    user: str, session: aiohttp.ClientSession = None
) -> Sequence[str]:

    # Scrapes a single watchlist page
    async def fetch_watchlist_page(page_number: int) -> Sequence[str]:
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
        if not data:  # Stops loop on empty page
            break

        # Extends watchlist with next page data
        watchlist.extend(await asyncio.gather(*data))
        page_number += 1

    if not watchlist:
        raise WatchlistEmptyException(f"{user}'s watchlist was empty")

    return watchlist


# Gets movie url
async def get_url(movie: Tag) -> str:

    if not movie:
        return None

    url = movie.div.get("data-target-link")  # gets Letterboxd URL

    return f"https://www.letterboxd.com{url}"


# Gets Letterboxd data
async def get_letterboxd_data(
    url: str, session: aiohttp.ClientSession
) -> Dict[str, Any]:

    # Scrapes relevant Letterboxd data from each page if possible
    try:
        async with session.get(url, timeout=60) as response:
            if response.status != 200:
                print(f"Failed to fetch {url}, status code: {response.status}")

                return None

            soup = BeautifulSoup(await response.text(), "html.parser")
            script = str(soup.find("script", {"type": "application/ld+json"}))
            script = script[52:-20]  # Trimmed to useful json data
            try:
                webData = json.loads(script)
            except:
                print(f"Error while scraping {title}")

                return None

            try:
                title = webData["name"]  # Title
                release_year = int(
                    webData["releasedEvent"][0]["startDate"]
                )  # Release year
                poster = webData["image"]  # Poster
            except:
                # Catches movies with missing data
                print(f"Failed to scrape {title} - missing data")
                return None

            try:
                tmdb_url = soup.find("a", {"data-track-action": "TMDB"})["href"]
                content_type = tmdb_url.split("/")[-3]  # Content type
            except Exception as e:
                # Catches movies missing content type
                print(f"Failed to scrape {title} - missing content type")

                return None

            return {
                "url": url,
                "title": title,
                "content_type": content_type,
                "release_year": release_year,
                "poster": poster,
            }
    except:
        print(f"Failed to scrape {title} - timed out")


async def main():

    watchlist_picks = await get_user_watchlist_picks(["victorverma"], "y", "random", 5)

    return watchlist_picks


if __name__ == "__main__":
    print(asyncio.run(main()))
