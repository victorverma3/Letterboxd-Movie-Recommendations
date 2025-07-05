import aiohttp
import argparse
import asyncio
from bs4 import BeautifulSoup, Tag
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
    user: str,
    session: aiohttp.ClientSession,
    exclude_liked: bool,
    verbose: bool,
    update_urls: bool,
) -> Tuple[pd.DataFrame, Sequence[int]]:

    start = time.perf_counter()

    ids = []
    usrratings = []
    liked = []
    urls = []
    unrated = []

    pageNumber = 1  # Start scraping from page 1

    # Asynchronously gathers the movie data
    results = []
    while True:
        async with session.get(
            f"https://letterboxd.com/{user}/films/page/{pageNumber}"
        ) as page:
            soup = BeautifulSoup(await page.text(), "html.parser")
            movies = soup.select("li.poster-container")
            if movies == []:  # Stops loop on empty page
                break
            tasks = [
                get_rating(movie=movie, user=user, verbose=verbose) for movie in movies
            ]
            results.extend(await asyncio.gather(*tasks))
            pageNumber += 1

    # Accumulates results
    for movie_id, rating, like, link, is_unrated in results:
        if is_unrated:
            unrated.append(movie_id)
        else:
            ids.append(movie_id)
            usrratings.append(rating)
            liked.append(like)
            urls.append(link)

    # Creates user df
    if exclude_liked:
        user_df = pd.DataFrame(
            {
                "movie_id": ids,
                "user_rating": usrratings,
                "url": urls,
                "username": user,
            },
        )
    else:
        user_df = pd.DataFrame(
            {
                "movie_id": ids,
                "user_rating": usrratings,
                "liked": liked,
                "url": urls,
                "username": user,
            },
        )
    user_df["movie_id"] = user_df["movie_id"].astype("int")
    user_df["url"] = user_df["url"].astype("string")

    # Verifies user has rated enough movies
    if len(user_df) < 5:
        raise Exception(f"{user} has not rated enough movies")

    # Updates movie urls in database
    if update_urls:

        urls_df = pd.DataFrame({"movie_id": ids, "url": urls})

        try:
            database.update_movie_urls(urls_df=urls_df)
            print(f"\nSuccessfully updated movie urls in database")
        except:
            print(f"\nFailed to update movie urls in database")

    finish = time.perf_counter()
    print(f"\nScraped {user}'s movie ratings in {finish - start} seconds")

    return user_df, unrated


# Scrapes rating for individual movie
async def get_rating(
    movie: Tag,
    user: str,
    verbose: bool = True,
) -> Tuple[int, str | None, bool, str, bool]:

    movie_id = movie.div.get("data-film-id")  # id
    title = movie.div.img.get("alt")  # title
    if verbose:
        print(title)
    like = True if movie.find("span", {"class": "like"}) is not None else False  # like
    link = movie.div.get("data-target-link")  # link

    try:
        rating = RATINGS[movie.p.span.text.strip()]  # rating

        return (int(movie_id), rating, like, link, False)
    except:
        if verbose:
            print(f"{title} is not rated by {user}")

        return (int(movie_id), None, like, link, True)


async def main(
    all: bool,
    exclude_liked: bool,
    output_path: str,
    users: str,
    update_ratings: bool,
    update_urls: bool,
    verbose: bool,
) -> None:

    if all:
        users = database.get_user_list()
    else:
        users = users.split(",")

    if output_path and os.path.exists(output_path):
        os.remove(output_path)

    user_df_batch = []
    for i, user in enumerate(users):
        async with aiohttp.ClientSession() as session:
            try:
                user_df, _ = await get_user_ratings(
                    user=user,
                    session=session,
                    exclude_liked=exclude_liked,
                    verbose=verbose,
                    update_urls=update_urls,
                )

                if verbose:
                    print(f"\n{user_df}")
                user_df = user_df.drop(columns=["url"])

                user_df_batch.append(user_df)
                if len(user_df_batch) == 10 or i == len(users) - 1:
                    combined_user_df_batch = pd.concat(user_df_batch, ignore_index=True)

                    if output_path:
                        combined_user_df_batch.to_csv(
                            output_path, mode="a", index=False, header=(i < 10)
                        )

                    if update_ratings:
                        try:
                            database.update_user_ratings(user_df=combined_user_df_batch)
                            print(
                                f"\nSuccessfully updated batch {i // 10} of user ratings in database"
                            )
                        except:
                            print(
                                f"\nFailed to updated batch {i // 10} of user ratings in database"
                            )

                    user_df_batch.clear()

            except Exception as e:
                print(e)


if __name__ == "__main__":

    parser = argparse.ArgumentParser()

    # Scrape all users
    parser.add_argument(
        "-a", "--all", help="Scrape all user ratings.", action="store_true"
    )

    # Include liked feature
    parser.add_argument(
        "-el",
        "--exclude-liked",
        help='Exclude whether the user marked a movie as "liked".',
        action="store_true",
    )

    parser.add_argument("-o", "--output-path", help="The output path of the CSV file.")

    # Update user ratings
    parser.add_argument(
        "-upr",
        "--update-ratings",
        help="Update the user ratings in the database.",
        action="store_true",
    )

    # Update movie urls
    parser.add_argument(
        "-upu",
        "--update-urls",
        help="Update the movie urls in the database.",
        action="store_true",
    )

    # Users whose ratings to scrape
    parser.add_argument(
        "-us",
        "--users",
        help="The users whose ratings to scrape. If including multiple users, format the input as a single comma-delimited string.",
    )

    # Verbosity
    parser.add_argument(
        "-v",
        "--verbose",
        help="Increase verbosity.",
        action="store_true",
    )

    args = parser.parse_args()

    if sum(bool(arg) for arg in [args.all, args.users]) != 1:
        raise ValueError(
            "Exactly one of the --all (-a) or --users (-us) arguments must be specified."
        )

    asyncio.run(
        main(
            all=args.all,
            exclude_liked=args.exclude_liked,
            output_path=args.output_path,
            users=args.users,
            update_ratings=args.update_ratings,
            update_urls=args.update_urls,
            verbose=args.verbose,
        )
    )
