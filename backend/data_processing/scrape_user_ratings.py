# imports
import os
import sys

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(project_root)
import aiohttp
import asyncio
from bs4 import BeautifulSoup
import data_processing.database as database
import pandas as pd
import time

# global
ratings = {
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


# scrapes user ratings
async def get_user_ratings(user, session, verbose=True):

    start = time.perf_counter()

    ids = []
    titles = []
    usrratings = []
    urls = []
    unrated = []

    pageNumber = 1  # start scraping from page 1

    # asynchronously gathers the movie data
    while True:
        async with session.get(
            f"https://letterboxd.com/{user}/films/page/{pageNumber}"
        ) as page:
            soup = BeautifulSoup(await page.text(), "html.parser")
            movies = soup.select("li.poster-container")
            if movies == []:  # stops loop on empty page
                break
            tasks = [
                get_rating(movie, user, ids, titles, usrratings, urls, unrated, verbose)
                for movie in movies
            ]
            await asyncio.gather(*tasks)
            pageNumber += 1

    # creates user df
    user_df = (
        pd.DataFrame(
            {
                "id": ids,
                "title": titles,
                "user_rating": usrratings,
                "url": urls,
            }
        )
        .sort_values(by="title")
        .reset_index(drop=True)
    )

    # updates user ratings data
    if len(user_df) > 0:
        try:
            database.update_user_ratings(user, user_df)
            print(f"\nsuccessfully updated {user}'s ratings in database")
        except:
            print(f"\nfailed to update {user}'s ratings in database")

        # creates urls df
        urls_df = pd.DataFrame({"movie_id": ids, "title": titles, "url": urls})

        # updates stored list of movie urls
        try:
            database.update_movie_urls(urls_df)
            print(f"\nsuccessfully updated movie urls in database")
        except:
            print(f"\nfailed to update movie urls in database")
    else:
        print(f"\nuser has not rated any movies")

    finish = time.perf_counter()
    print(f"\nscraped {user}'s movie data in {finish - start} seconds")

    return user_df, unrated


# scrapes rating for individual movie
async def get_rating(movie, user, ids, titles, usrratings, urls, unrated, verbose=True):

    movie_id = movie.div.get("data-film-id")
    title = movie.div.img.get("alt")
    if verbose:
        print(title)
    link = f'https://letterboxd.com/{movie.div.get("data-target-link")}'

    try:
        r = ratings[movie.p.span.text]
    except:
        # appends unrated movies to unrated array
        if verbose:
            print(f"{title} is not rated by {user}")
        unrated.append(movie_id)
        return

    ids.append(movie_id)
    titles.append(title)
    usrratings.append(r)
    urls.append(link)


async def main(user):

    async with aiohttp.ClientSession() as session:
        user_df, unrated = await get_user_ratings(user, session)
        print(f"\n{user_df}")


if __name__ == "__main__":

    user = str(input("\nEnter a Letterboxd username: "))
    asyncio.run(main(user))
