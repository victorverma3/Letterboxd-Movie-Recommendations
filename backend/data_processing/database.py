from dotenv import load_dotenv
import os
import pandas as pd
from supabase import create_client, Client

# initialize supabase
load_dotenv()
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)


# gets a list of all users in the database
def get_users_in_db():

    try:
        users, count = supabase.table("users").select("*").execute()
        return sorted([user["username"] for user in users[1]])
    except Exception as e:
        print(e)
        raise e


# updates the list of all users in the database
def update_users_in_db(user):

    try:
        supabase.table("users").upsert({"username": user}).execute()
    except Exception as e:
        print(e)
        raise e


# deletes a user from the list of all users in the database
def delete_user_in_db(user):

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
        return pd.DataFrame.from_records(user_data[1])
    except Exception as e:
        print(e)
        raise e


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
        return pd.DataFrame.from_records(movie_urls[1])
    except Exception as e:
        print(e)
        raise e


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
def update_movie_data(movie_df):

    movie_records = movie_df.to_dict(orient="records")

    try:
        supabase.table("movie_data").upsert(movie_records).execute()
    except Exception as e:
        print(e)
        raise e


# updates the table of missing movie data in the database
def update_missing_urls(missing_df):

    missing_records = missing_df.to_dict(orient="records")

    try:
        supabase.table("missing_urls").upsert(missing_records).execute()
    except Exception as e:
        print(e)
        raise e
