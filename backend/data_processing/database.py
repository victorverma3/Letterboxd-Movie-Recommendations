# imports
from datetime import datetime, timezone
from dotenv import load_dotenv
import os
import pandas as pd
import pymongo
from pymongo import UpdateOne
import sqlite3
from supabase import create_client, Client

# initializes supabase
load_dotenv()
try:
    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_KEY")
    supabase: Client = create_client(supabase_url, supabase_key)
except Exception as e:
    print("\nfailed to connect to Supabase: ", e)
try:
    client = pymongo.MongoClient(os.environ.get("MONGODBURI"))
    mongodb = client["letterboxd-movie-recommendations-db"]
except Exception as e:
    print("\nfailed to connect to MongoDB: ", e)


# gets a list of all users in the database
def get_user_log():

    try:
        users, _ = supabase.table("users").select("username").execute()
    except Exception as e:
        print(e)
        raise e

    return sorted([user["username"] for user in users[1]])


# gets a list of all users who have logged statistics in the database
def get_statistics_user_log():

    try:
        collection = mongodb["user-statistics-collection"]
        documents = collection.find(
            {},
            {
                "_id": 0,
                "username": 1,
            },
        )
        return sorted([user["username"] for user in documents])
    except Exception as e:
        print(e)
        raise e


# logs a user in the database
def update_user_log(user):

    try:
        user_log, _ = supabase.table("users").select("*").eq("username", user).execute()

        supabase.table("users").upsert(
            {
                "username": user,
                "count": user_log[1][0]["count"] + 1 if user_log[1] != [] else 1,
                "last_used": datetime.now(tz=timezone.utc).isoformat(),
                "first_used": (
                    user_log[1][0]["first_used"]
                    if user_log[1] != []
                    else datetime.now(tz=timezone.utc).isoformat()
                ),
            }
        ).execute()

    except Exception as e:
        print(e)
        raise e


# deletes a user from the list of all users in the database
def delete_user_log(user):

    try:
        supabase.table("users").delete().eq("username", user).execute()
    except Exception as e:
        print(e)
        raise e


# gets a user's ratings from the database
def get_user_data(user):

    try:
        user_data, _ = (
            supabase.table("users").select("*").eq("username", user).execute()
        )
    except Exception as e:
        print(e)
        raise e

    return pd.DataFrame.from_records(user_data[1])


# updates a user's ratings in the database
def update_user_data(user, user_df):

    user_records = user_df.to_dict(orient="records")
    for record in user_records:
        record["username"] = user

    try:
        supabase.table("user_ratings").upsert(user_records).execute()
    except Exception as e:
        print(e)
        raise e


# deletes a user's ratings from the database
def delete_user_data(user):

    try:
        supabase.table("user_ratings").delete().eq("username", user).execute()
    except Exception as e:
        print(e)
        raise e


# gets the table of movie urls in the database
def get_movie_urls():

    try:
        movie_urls, _ = supabase.table("movie_urls").select("*").execute()
    except Exception as e:
        print(e)
        raise e

    return pd.DataFrame.from_records(movie_urls[1])


# updates the table of movie urls in the database
def update_movie_urls(urls_df):

    url_records = urls_df.to_dict(orient="records")

    try:
        supabase.table("movie_urls").upsert(url_records).execute()
    except Exception as e:
        print(e)
        raise e


# gets and processes the movie data from the database
def get_movie_data():

    try:
        movie_data, _ = supabase.table("movie_data").select("*").execute()
        movie_data = pd.DataFrame.from_records(movie_data[1])
        movie_data["title"] = movie_data["title"].astype("string")
        movie_data["url"] = movie_data["url"].astype("string")
        return movie_data
    except Exception as e:
        print(e)
        raise e


# updates the movie data in the database
def update_movie_data(movie_df, local):

    try:
        if local:
            with sqlite3.connect("local_data.db") as conn:
                movie_df.to_sql("movie_data", conn, if_exists="replace", index=False)
                conn.commit()
        else:
            movie_records = movie_df.to_dict(orient="records")
            supabase.table("movie_data").upsert(movie_records).execute()
    except Exception as e:
        print(e)
        raise e


# gets all user statistics from the database
def get_all_user_statistics():

    try:
        collection = mongodb["user-statistics-collection"]
        statistics = collection.find({}, {"_id": 0})
        return pd.DataFrame(statistics)
    except Exception as e:
        print(e)
        raise e


# updates a user's statistics in the database
def update_user_statistics(user, user_stats):

    try:
        collection = mongodb["user-statistics-collection"]
        collection.update_one(
            {"username": user},
            {
                "$set": {
                    "mean_user_rating": user_stats["user_rating"]["mean"],
                    "mean_letterboxd_rating": user_stats["letterboxd_rating"]["mean"],
                    "mean_letterboxd_rating_count": user_stats[
                        "letterboxd_rating_count"
                    ]["mean"],
                    "last_updated": datetime.now(tz=timezone.utc).isoformat(),
                }
            },
            upsert=True,
        )
    except Exception as e:
        print(e)
        raise e


# updates many user statistics in the database
def update_many_user_statistics(all_stats):

    try:
        collection = mongodb["user-statistics-collection"]
        operations = []

        for username, user_stats in all_stats.items():
            operations.append(
                UpdateOne(
                    {"username": username},
                    {
                        "$set": {
                            "mean_user_rating": user_stats["user_rating"]["mean"],
                            "mean_letterboxd_rating": user_stats["letterboxd_rating"][
                                "mean"
                            ],
                            "mean_letterboxd_rating_count": user_stats[
                                "letterboxd_rating_count"
                            ]["mean"],
                            "last_updated": datetime.now(tz=timezone.utc).isoformat(),
                        }
                    },
                    upsert=True,
                )
            )

        if operations:
            result = collection.bulk_write(operations)
            print(f"bulk write result: {result.bulk_api_result}")

    except Exception as e:
        print(e)
        raise e
