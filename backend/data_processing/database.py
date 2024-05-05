# imports
from datetime import datetime, timezone
from dotenv import load_dotenv
import os
import pandas as pd
import sqlite3
from supabase import create_client, Client

# initializes supabase
load_dotenv()
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)


# gets a list of all users in the database
def get_user_log():

    try:
        users, count = supabase.table("users").select("*").execute()
    except Exception as e:
        print(e)
        raise e

    return sorted([user["username"] for user in users[1]])


# gets a list of all users who have logged statistics in the database
def get_statistics_user_log():

    try:
        users, count = supabase.table("user_statistics").select("*").execute()
        return sorted([user["username"] for user in users[1]])
    except Exception as e:
        print(e)
        raise e


# logs a user in the database
def update_user_log(user):

    try:
        user_log, count = (
            supabase.table("users").select("*").eq("username", user).execute()
        )

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
        user_data, count = (
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
        movie_urls, count = supabase.table("movie_urls").select("*").execute()
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


# gets the movie data from the database
def get_movie_data():

    try:
        movie_data, count = supabase.table("movie_data").select("*").execute()
        return pd.DataFrame.from_records(movie_data[1])
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
        statistics, count = supabase.table("user_statistics").select("*").execute()
        return pd.DataFrame(statistics[1])
    except Exception as e:
        print(e)
        raise e


# updates a user's statistics in the database
def update_user_statistics(user, user_stats):

    try:
        supabase.table("user_statistics").upsert(
            {
                "username": user,
                "mean_user_rating": user_stats["user_rating"]["mean"],
                "mean_letterboxd_rating": user_stats["letterboxd_rating"]["mean"],
                "mean_letterboxd_rating_count": user_stats["letterboxd_rating_count"][
                    "mean"
                ],
                "last_updated": datetime.now(tz=timezone.utc).isoformat(),
            }
        ).execute()
    except Exception as e:
        print(e)
        raise e
