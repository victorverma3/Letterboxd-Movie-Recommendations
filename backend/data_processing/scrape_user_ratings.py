import aiohttp
import asyncio
from bs4 import BeautifulSoup, ResultSet, Tag
import os
import pandas as pd
import sys
import time
from typing import Sequence, Tuple

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(project_root)

import data_processing.database as database


RATINGS = {
    "½": 0.5,
    "★": 1,
    "★½": 1.5,
    "★★": 2,
    "★★½": 2.5,
    "★★★": 3,
    "★★★½": 3.5,
    "★★★★": 4,
    "★★★★½": 4.5,
    "★★★★★": 5,
}


# Scrapes user ratings
async def get_user_ratings(
    user: str, session: aiohttp.ClientSession, verbose: bool, update_urls: bool
) -> Tuple[pd.DataFrame, Sequence[int]]:

    start = time.perf_counter()

    ids = []
    usrratings = []
    liked = []
    urls = []
    unrated = []

    pageNumber = 1  # Start scraping from page 1

    # Asynchronously gathers the movie data
    while True:
        async with session.get(
            f"https://letterboxd.com/{user}/films/page/{pageNumber}"
        ) as page:
            soup = BeautifulSoup(await page.text(), "html.parser")
            movies = soup.select("li.poster-container")
            if movies == []:  # Stops loop on empty page
                break
            tasks = [
                get_rating(movie, user, ids, usrratings, liked, urls, unrated, verbose)
                for movie in movies
            ]
            await asyncio.gather(*tasks)
            pageNumber += 1

    # Creates user df
    user_df = pd.DataFrame(
        {
            "movie_id": ids,
            "user_rating": usrratings,
            "liked": liked,
            "url": urls,
            "username": user,
        },
    )

    # Verifies user has rated enough movies
    if len(user_df) < 5:
        raise Exception

    # Updates movie urls in database
    if update_urls:

        urls_df = pd.DataFrame({"movie_id": ids, "url": urls})

        try:
            database.update_movie_urls(urls_df)
            print(f"\nsuccessfully updated movie urls in database")
        except:
            print(f"\nfailed to update movie urls in database")

    finish = time.perf_counter()
    print(f"\nscraped {user}'s movie data in {finish - start} seconds")

    return user_df, unrated


# Scrapes rating for individual movie
async def get_rating(
    movie: Tag,
    user: str,
    ids: Sequence[str],
    usrratings: Sequence[float],
    liked: Sequence[int],
    urls: Sequence[str],
    unrated: Sequence[int],
    verbose: bool = True,
):

    movie_id = movie.div.get("data-film-id")  # id
    title = movie.div.img.get("alt")  # title
    if verbose:
        print(title)
    l = 1 if movie.find("span", {"class": "like"}) is not None else 0  # like
    link = f'https://letterboxd.com{movie.div.get("data-film-link")}'  # link

    try:
        r = RATINGS[movie.p.span.text.strip()]  # rating
    except:
        # appends unrated movies to unrated array
        if verbose:
            print(f"{title} is not rated by {user}")
        unrated.append(int(movie_id))

        return

    ids.append(movie_id)
    usrratings.append(r)
    liked.append(l)
    urls.append(link)


async def main(user: str):

    async with aiohttp.ClientSession() as session:
        try:
            user_df, _ = await get_user_ratings(
                user, session, verbose=True, update_urls=True
            )
            print(f"\n{user_df}")
        except Exception as e:
            raise e


if __name__ == "__main__":

    user = str(input("\nEnter a Letterboxd username: "))
    asyncio.run(main(user))
