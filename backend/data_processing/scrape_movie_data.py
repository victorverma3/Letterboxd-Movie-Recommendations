import aiohttp
import argparse
import asyncio
from bs4 import BeautifulSoup
import json
import os
import pandas as pd
import re
import requests
import sys
import time
from typing import Any, Dict, Sequence, Tuple

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(project_root)

import data_processing.database as database
from data_processing.arg_checks import check_num_movies_argument_type


# Encodes genres as integers
def encode_genres(genres: Sequence[str]) -> int:

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


# Maps country of origin to numerical values
def assign_countries(country_of_origin: str) -> int:

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


# Scrapes movie data
async def movie_crawl(
    movie_urls: pd.DataFrame,
    session: aiohttp.ClientSession,
    show_objects: bool,
    update_movie_data: bool,
    verbose: bool = False,
) -> Tuple[int, int, int]:

    movie_data = []
    for _, row in movie_urls.iterrows():
        result = await get_letterboxd_data(row=row, session=session, verbose=verbose)
        if show_objects:
            print(result)
        if result:
            movie_data.append(result)

    # Processes movie data
    movie_data_df = pd.DataFrame(movie_data)
    movie_data_df["genres"] = movie_data_df["genres"].apply(
        lambda genres: [genre.lower().replace(" ", "_") for genre in genres]
    )
    movie_data_df["genres"] = movie_data_df["genres"].apply(encode_genres)
    movie_data_df["country_of_origin"] = movie_data_df["country_of_origin"].apply(
        assign_countries
    )

    # Updates movie data and genres in database
    if update_movie_data:
        try:
            database.update_movie_data(movie_data_df=movie_data_df)
            print(f"Successfully updated batch movie data in database")

            return [1, len(movie_data_df), 0]
        except Exception as e:
            print(f"Failed to update batch movie data in database")

            return [0, 0, 1]


# Gets Letterboxd data
async def get_letterboxd_data(
    row: pd.DataFrame, session: aiohttp.ClientSession, verbose: bool
) -> Dict[str, Any]:

    movie_id = row["movie_id"]  # ID
    url = row["url"]  # URL

    # Scrapes relevant Letterboxd data from each page if possible
    try:
        async with session.get(url, timeout=60) as response:
            if response.status != 200:
                print(f"Failed to fetch {url} - status code:", response.status)

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
                if verbose:
                    print(f"Scraping {title}")
                release_year = int(
                    webData["releasedEvent"][0]["startDate"]
                )  # Release year
                runtime = int(
                    re.search(
                        r"(\d+)\s+mins", soup.find("p", {"class": "text-footer"}).text
                    ).group(1)
                )  # Runtime
                rating = webData["aggregateRating"]["ratingValue"]  # Letterboxd rating
                rating_count = webData["aggregateRating"][
                    "ratingCount"
                ]  # Letterboxd rating count
                genre = webData["genre"]  # Genres
                country = webData["countryOfOrigin"][0]["name"]  # Country of origin
                poster = webData["image"]  # Poster
            except asyncio.TimeoutError:
                # Catches timeout
                print(f"Failed to scrape - timed out")

                return None
            except aiohttp.ClientOSError as e:
                print("Connection terminated by Letterboxd")
                raise e
            except:
                # Catches movies with missing data
                print(f"Failed to scrape {title} - missing data")

                return None

            try:
                tmdb_url = soup.find("a", {"data-track-action": "TMDB"})["href"]
                if "/movie/" in tmdb_url:  # Content type
                    content_type = "movie"
                else:
                    content_type = "tv"
            except Exception as e:
                # Catches movies missing content type
                print(f"Failed to scrape {title} - missing content type")

                return None

        return {
            "movie_id": movie_id,
            "url": url,
            "title": title,
            "content_type": content_type,
            "release_year": release_year,
            "runtime": runtime,
            "letterboxd_rating": rating,
            "letterboxd_rating_count": rating_count,
            "genres": genre,
            "country_of_origin": country,
            "poster": poster,
        }
    except aiohttp.ClientOSError as e:
        raise e
    except:
        print(f"Failed to scrape {url} - timed out")


async def main(
    clear_movie_data_cache: bool,
    num_movies: str | int,
    show_objects: bool,
    movie_url: str | None,
    update_movie_data: bool,
) -> None:

    start = time.perf_counter()

    # Gets movie URLs
    if movie_url is not None:
        movie_urls = database.get_movie_urls()
        movie_urls = movie_urls[movie_urls["url"] == movie_url]
    elif num_movies == "all":
        movie_urls = database.get_movie_urls()
    else:
        movie_urls = database.get_movie_urls()[:num_movies]

    # Creates URL batches
    batch_size = 500
    url_batches = [
        movie_urls.iloc[i : i + batch_size]
        for i in range(0, len(movie_urls), batch_size)
    ]

    # Processes each batch asynchronously
    session_refresh = 5
    results = []
    for i in range(0, len(url_batches), session_refresh):
        async with aiohttp.ClientSession() as session:
            tasks = [
                movie_crawl(
                    movie_urls=batch,
                    session=session,
                    show_objects=show_objects,
                    update_movie_data=update_movie_data,
                    verbose=False,
                )
                for batch in url_batches[i : i + session_refresh]
            ]
            results.extend(await asyncio.gather(*tasks))

    if update_movie_data:
        num_successes = sum([r[0] for r in results])
        num_updates = sum([r[1] for r in results])
        num_failures = sum([r[2] for r in results])

        print(f"Successfully updated {num_successes} batches in database")
        print(f"Failed to update {num_failures} batches in database")
        print(f"Successfully updated {num_updates} movies in database")
    else:
        print("Did not update movie data in database")

    finish = time.perf_counter()
    print(f"Scraped movie data in {finish - start} seconds")

    # Clears movie data cache
    if clear_movie_data_cache:
        try:
            url = f'{os.getenv("BACKEND_URL")}/api/admin/clear-movie-data-cache'
            headers = {"Authorization": f'Bearer {os.getenv("ADMIN_SECRET_KEY")}'}
            requests.post(url=url, headers=headers)
            print("Successfully cleared movie data cache")
        except Exception as e:
            print("Failed to clear movie data cache")


if __name__ == "__main__":

    parser = argparse.ArgumentParser()

    # Clear movie data cache
    parser.add_argument(
        "-c",
        "--clear-movie-data-cache",
        help="Clears the movie data cache.",
        action="store_true",
    )

    # Number of movies
    parser.add_argument(
        "-n",
        "--num_movies",
        type=check_num_movies_argument_type,
        help="Specifies the first n movies to scrape.",
        default="all",
    )

    # Show movie data object
    parser.add_argument(
        "-o",
        "--show-objects",
        help="Displays the movie data objects.",
        action="store_true",
    )

    # Scrape movie url
    parser.add_argument(
        "-l",
        "--movie_url",
        help="Specifies the URL of the movie to scrape.",
        default=None,
    )

    # Update movie data
    parser.add_argument(
        "-u",
        "--update-movie-data",
        help="Updates the movie data in the database.",
        action="store_true",
    )

    args = parser.parse_args()

    asyncio.run(
        main(
            clear_movie_data_cache=args.clear_movie_data_cache,
            num_movies=args.num_movies,
            show_objects=args.show_objects,
            movie_url=args.movie_url,
            update_movie_data=args.update_movie_data,
        )
    )
