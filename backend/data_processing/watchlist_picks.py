import aiohttp
import argparse
import asyncio
from bs4 import BeautifulSoup, Tag
from itertools import chain
import json
import os
import random
import sys
import time
from typing import Any, Dict, Literal, Sequence

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(project_root)

from data_processing.utils import redis
from model.recommender import merge_recommendations, recommend_n_watchlist_movies


# Custom exceptions
class WatchlistEmptyException(Exception):
    def __init__(self, message, errors=None):
        super().__init__(message)
        self.errors = errors


class WatchlistMoviesMissingException(Exception):
    def __init__(self, message, errors=None):
        super().__init__(message)
        self.errors = errors


class WatchlistOverlapException(Exception):
    def __init__(self, message, errors=None):
        super().__init__(message)
        self.errors = errors


# Gets picks from watchlists
async def get_user_watchlist_picks(
    user_list: Sequence[str],
    overlap: Literal["y", "n"],
    pick_type: Literal["random", "recommendation"],
    model_type: Literal["personalized", "collaborative", "general"],
    num_picks: int,
) -> Sequence[Dict[str, Any]]:

    # Verifies parameters
    if num_picks < 1:
        raise ValueError("Number of picks must be an integer greater than 0")

    # Asynchronously scrapes the user watchlists
    async def fetch_watchlist(
        user: str, session: aiohttp.ClientSession
    ) -> Sequence[str]:

        cache_key = f"user_watchlist:{user}"
        cached = redis.get(cache_key)

        if cached is not None:
            watchlist = json.loads(cached)
        else:
            start = time.perf_counter()

            watchlist = await get_watchlist(user=user, session=session)

            finish = time.perf_counter()
            print(f"Scraped {user}'s watchlist in {finish - start} seconds")

            redis.set(
                cache_key,
                json.dumps(watchlist),
                ex=3600,
            )

        return watchlist

    watchlists = []
    async with aiohttp.ClientSession() as session:
        tasks = [fetch_watchlist(user=user, session=session) for user in user_list]
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
            tasks = [get_letterboxd_data(url=url, session=session) for url in picks]
            watchlist_picks = await asyncio.gather(*tasks)

        watchlist_picks = [pick for pick in watchlist_picks if pick is not None]
    else:
        if len(user_list) == 1:
            watchlist_picks = await recommend_n_watchlist_movies(
                num_recs=100,
                user=user_list[0],
                model_type=model_type,
                watchlist_pool=watchlist_pool,
            )
            watchlist_picks = watchlist_picks["recommendations"].to_dict(
                orient="records"
            )

        else:
            tasks = [
                recommend_n_watchlist_movies(
                    num_recs=100,
                    user=username,
                    model_type=model_type,
                    watchlist_pool=watchlist_pool,
                )
                for username in user_list
            ]
            all_recommendations = await asyncio.gather(*tasks)

            # Merges recommendations
            watchlist_picks = merge_recommendations(
                num_recs=100, all_recommendations=all_recommendations
            )
            watchlist_picks = watchlist_picks.to_dict(orient="records")

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

            return [get_url(movie=movie) for movie in movies]

    watchlist = []
    page_number = 1

    while True:
        data = await fetch_watchlist_page(page_number=page_number)
        if not data:  # Stops loop on empty page
            break

        # Extends watchlist with next page data
        watchlist.extend(data)
        page_number += 1

    if not watchlist:
        raise WatchlistEmptyException(f"{user}'s watchlist is empty")

    return watchlist


# Gets movie url
def get_url(movie: Tag) -> str:

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


async def main(
    user_list: str,
    overlap: Literal["y", "n"] = "y",
    pick_type: Literal["random", "recommendation"] = "random",
    model_type: Literal["personalized", "collaborative", "general"] = "personalized",
    num_picks: int = 5,
):

    watchlist_picks = await get_user_watchlist_picks(
        user_list=user_list.split(","),
        overlap=overlap,
        pick_type=pick_type,
        model_type=model_type,
        num_picks=num_picks,
    )

    return watchlist_picks


if __name__ == "__main__":

    parser = argparse.ArgumentParser()

    # Model type
    parser.add_argument(
        "-m",
        "--model-type",
        choices=["personalized", "collaborative", "general"],
        default="personalized",
        help="Choose the recommendation model to use.",
    )

    # Number of watchlist picks
    parser.add_argument(
        "-n",
        "--num-picks",
        type=int,
        default=5,
        help="The number of movies to pick from the watchlist(s).",
    )

    # Overlap
    parser.add_argument(
        "-o",
        "--overlap",
        choices=["y", "n"],
        default="y",
        help="Only consider movies that appear on all watchlists.",
    )

    # Pick type
    parser.add_argument(
        "-p",
        "--pick-type",
        choices=["random", "recommendation"],
        default="random",
        help="Choose movies at random or by recommendation.",
    )

    # Users whose watchlist to scrape
    parser.add_argument(
        "-usl",
        "--user-list",
        required=True,
        help="The users whose watchlist to scrape. If including multiple users, format the input as a single comma-delimited string.",
    )

    args = parser.parse_args()

    print(
        asyncio.run(
            main(
                user_list=args.user_list,
                overlap=args.overlap,
                pick_type=args.pick_type,
                model_type=args.model_type,
                num_picks=args.num_picks,
            )
        )
    )
