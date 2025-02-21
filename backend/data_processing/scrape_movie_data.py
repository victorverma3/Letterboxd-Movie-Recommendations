# Imports
import aiohttp
import asyncio
from bs4 import BeautifulSoup
import json
import os
import pandas as pd
import re
import sys
import time

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(project_root)

import data_processing.database as database


# encodes genres as integers
def encode_genres(genres):

    genre_options = [
        "action",
        "adventure",
        "animation",
        "comedy",
        "crime",
        "documentary",
        "drama",
        "family",
        "fantasy",
        "history",
        "horror",
        "music",
        "mystery",
        "romance",
        "science_fiction",
        "tv_movie",
        "thriller",
        "war",
        "western",
    ]

    genre_binary = ""
    for genre in genre_options:
        if genre in genres:
            genre_binary += "1"
        else:
            genre_binary += "0"

    genre_int = int(genre_binary, 2)

    return genre_int


# maps countries to numerical values
def assign_countries(country_of_origin):

    country_map = {
        "USA": 0,
        "UK": 1,
        "China": 2,
        "France": 3,
        "Japan": 4,
        "Germany": 5,
        "South Korea": 6,
        "Canada": 7,
        "India": 8,
        "Austrailia": 9,
        "Hong Kong": 10,
        "Italy": 11,
        "Spain": 12,
        "Brazil": 13,
        "USSR": 14,
    }

    return country_map.get(country_of_origin, len(country_map))


# scrapes movie data
async def movie_crawl(movie_urls, session, verbose=False):

    movie_data = []
    for _, row in movie_urls.iterrows():
        result = await get_letterboxd_data(row, session, verbose)
        if result:
            movie_data.append(result)

    # processes movie data
    movie_data_df = pd.DataFrame(movie_data)
    movie_data_df["genres"] = movie_data_df["genres"].apply(
        lambda genres: [genre.lower().replace(" ", "_") for genre in genres]
    )
    movie_data_df["genres"] = movie_data_df["genres"].apply(encode_genres)
    movie_data_df["country_of_origin"] = movie_data_df["country_of_origin"].apply(
        assign_countries
    )

    # updates movie data and genres in database
    try:
        database.update_movie_data(movie_data_df, False)
        print(f"\nSuccessfully updated batch movie data in database")
        return [1, len(movie_data_df), 0]
    except Exception as e:
        print(f"\nFailed to update batch movie data in database")
        return [0, 0, 1]


# gets Letterboxd data
async def get_letterboxd_data(row, session, verbose):

    movie_id = row["movie_id"]  # id
    url = row["url"]  # url

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
                if verbose:
                    print(f"Scraping {title}")
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
                poster = webData["image"]  # poster
            except asyncio.CancelledError as e:
                # catches cancellation
                print(f"Scraping {title} was cancelled")
                raise e
            except asyncio.TimeoutError:
                # catches timeout
                print(f"Failed to scrape - timed out")
                return None
            except:
                # catches movies with missing data
                print(f"Failed to scrape {title} - missing data")
                return None

            return {
                "movie_id": movie_id,
                "url": url,
                "title": title,
                "release_year": release_year,
                "runtime": runtime,
                "letterboxd_rating": rating,
                "letterboxd_rating_count": rating_count,
                "genres": genre,
                "country_of_origin": country,
                "poster": poster,
            }
    except asyncio.CancelledError as e:
        raise e
    except:
        print(f"Failed to scrape {title} - timed out")


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

    # processes each batch asynchronously
    async with aiohttp.ClientSession() as session:
        tasks = [movie_crawl(batch, session, True) for batch in url_batches]
        results = await asyncio.gather(*tasks)
        num_successes = sum([result[0] for result in results])
        num_updates = sum([result[1] for result in results])
        num_failures = sum([result[2] for result in results])

    print(f"\nSuccessfully updated {num_successes} batches in database")
    print(f"\nFailed to update {num_failures} batches in database")
    print(f"\nSuccessfully updated {num_updates} movies in database")

    finish = time.perf_counter()
    print(f"\nScraped movie data in {finish - start} seconds")


if __name__ == "__main__":
    asyncio.run(main())
