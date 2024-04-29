# imports
import os
import sys

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(project_root)
import aiohttp
import asyncio
from bs4 import BeautifulSoup

import data_processing.database as database
import json
import pandas as pd
import re
from model.recommender import process
import time


# scrapes movie data
async def movie_crawl(verbose, session=None):

    start = time.perf_counter()

    missing_df = pd.DataFrame(columns=["movie_id", "url"])

    movie_urls = database.get_movie_urls()

    ids = []
    titles = []
    years = []
    runtimes = []
    lrs = []
    lrcs = []
    genres = []
    countries = []
    urls = []

    tasks = [
        get_letterboxd_data(
            row,
            ids,
            titles,
            years,
            runtimes,
            lrs,
            lrcs,
            genres,
            countries,
            urls,
            verbose,
            session,
        )
        for index, row in movie_urls.iterrows()
    ]
    results = await asyncio.gather(*tasks)

    missing_data = []
    for result in results:
        if result is not None:
            missing_data.append(result)
    if missing_data:
        missing_df = pd.DataFrame(missing_data)
    else:
        missing_df = pd.DataFrame()
    # missing_dfs = [result for result in results if result is not None and result.empty]
    # if missing_dfs:
    #     missing_df = pd.concat(missing_dfs, ignore_index=True)

    movie_df = pd.DataFrame(
        {
            "movie_id": ids,
            "title": titles,
            "release_year": years,
            "runtime": runtimes,
            "letterboxd_rating": lrs,
            "letterboxd_rating_count": lrcs,
            "genres": genres,
            "country_of_origin": countries,
            "url": urls,
        }
    )

    # processes movie data
    processed_movie_df = process(movie_df)

    # updates movie data in database
    try:
        database.update_movie_data(processed_movie_df)
        print(f"\nsuccessfully updated movie data in database")
    except:
        print(f"\nfailed to update movie data in database")

    # updates missing urls in database
    if len(missing_df) > 0:
        try:
            database.update_missing_urls(missing_df)
            print(f"\nsuccessfully updated missing movie data in database")
        except:
            print(f"\nfailed to update missing movie data in database")

    await session.close()

    finish = time.perf_counter()
    print(f"\nscraped movie data in {finish - start} seconds\n")

    return movie_df, missing_df


async def get_letterboxd_data(
    row,
    ids,
    titles,
    years,
    runtimes,
    lrs,
    lrcs,
    genres,
    countries,
    urls,
    verbose,
    session,
):

    movie_id = row["movie_id"]  # id
    title = row["title"]  # title
    if verbose:
        print(title)
    url = row["url"]  # url

    async with session.get(url) as page:

        soup = BeautifulSoup(await page.text(), "html.parser")
        script = str(soup.find("script", {"type": "application/ld+json"}))
        script = script[52:-20]  # trimmed to useful json data
        try:
            webData = json.loads(script)
        except:
            print(f"error while scraping {title}")
            return

    # scrapes relevant Letterboxd data from each page if possible
    try:
        release_year = int(webData["releasedEvent"][0]["startDate"])  # release year
        runtime = int(
            re.search(
                r"(\d+)\s+mins", soup.find("p", {"class": "text-footer"}).text
            ).group(1)
        )  # runtime
        rating = webData["aggregateRating"]["ratingValue"]  # Letterboxd rating
        rating_count = webData["aggregateRating"][
            "ratingCount"
        ]  # Letterboxd rating count
        genre = webData["genre"]  # genres
        country = webData["countryOfOrigin"][0]["name"]  # country of origin
    except:
        # appends movies with incomplete data to missing
        missing = {"movie_id": movie_id, "url": url}
        print(f"failed to scrape {title} - missing data")
        return missing

    ids.append(movie_id)
    titles.append(title)
    years.append(release_year)
    runtimes.append(runtime)
    lrs.append(rating)
    lrcs.append(rating_count)
    genres.append(genre)
    countries.append(country)
    urls.append(url)

    return


async def main():

    async with aiohttp.ClientSession() as session:
        movie_df, missing_df = await movie_crawl(False, session)


if __name__ == "__main__":

    asyncio.run(main())
