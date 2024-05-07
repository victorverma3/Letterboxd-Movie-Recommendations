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
from model.recommender import process
import pandas as pd
import re
import time


# scrapes movie data
async def movie_crawl(movie_urls, session, verbose=False):

    results = []
    for index, row in movie_urls.iterrows():
        result = await get_letterboxd_data(row, session, verbose)
        if result:
            results.append(result)

    # # processes movie data
    movie_df = pd.DataFrame(results)
    processed_movie_df = process(movie_df)

    # updates movie data in database
    try:
        database.update_movie_data(processed_movie_df, False)
        print(f"\nsuccessfully updated batch movie data in database")
        return [1, len(processed_movie_df), 0]
    except Exception as e:
        print(f"\nfailed to update batch movie data in database")
        return [0, 0, 1]


# gets Letterboxd data
async def get_letterboxd_data(row, session, verbose):

    movie_id = row["movie_id"]  # id
    title = row["title"]  # title
    if verbose:
        print(f"scraping {title}")
    url = row["url"]  # url

    # scrapes relevant Letterboxd data from each page if possible

    try:
        async with session.get(url, timeout=60) as response:
            if response.status != 200:
                print(f"failed to fetch {url}, status code: {response.status}")
                return None

            soup = BeautifulSoup(await response.text(), "html.parser")
            script = str(soup.find("script", {"type": "application/ld+json"}))
            script = script[52:-20]  # trimmed to useful json data
            try:
                webData = json.loads(script)
            except:
                print(f"error while scraping {title}")
                return None

            try:
                release_year = int(
                    webData["releasedEvent"][0]["startDate"]
                )  # release year
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
                # catches movies with missing data
                print(f"failed to scrape {title} - missing data")
                return None

            return {
                "movie_id": movie_id,
                "title": title,
                "release_year": release_year,
                "runtime": runtime,
                "letterboxd_rating": rating,
                "letterboxd_rating_count": rating_count,
                "genres": genre,
                "country_of_origin": country,
                "url": url,
            }
    except:
        print(f"failed to scrape {title} - timed out")


async def main():

    start = time.perf_counter()

    # gets movie urls from database
    movie_urls = database.get_movie_urls()

    # creates URL batches
    batch_size = 500

    url_batches = [
        movie_urls.iloc[i : i + batch_size]
        for i in range(0, len(movie_urls), batch_size)
    ]
    async with aiohttp.ClientSession() as session:
        # processes each batch asynchronously
        tasks = [movie_crawl(batch, session, True) for batch in url_batches]
        results = await asyncio.gather(*tasks)
        num_successes = sum([result[0] for result in results])
        num_updates = sum([result[1] for result in results])
        num_failures = sum([result[2] for result in results])

    print(f"\nsuccessfully updated {num_successes} batches in database")
    print(f"\nfailed to update {num_failures} batches in database")
    print(f"\nsuccessfully updated {num_updates} movies in database")

    finish = time.perf_counter()
    print(f"\nscraped movie data in {finish - start} seconds")


if __name__ == "__main__":
    asyncio.run(main())
