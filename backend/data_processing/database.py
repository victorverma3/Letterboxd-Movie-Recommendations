# imports
from datetime import datetime, timezone
from dotenv import load_dotenv
import os
import pandas as pd
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


# gets list of all users from database
def get_user_log():

    try:
        users, _ = supabase.table("users").select("username").execute()
    except Exception as e:
        print(e)
        raise e

    return sorted([user["username"] for user in users[1]])


# gets list of all users who have logged statistics from database
def get_statistics_user_log():

    try:
        users, _ = supabase.table("user_statistics").select("username").execute()
        return sorted([user["username"] for user in users[1]])
    except Exception as e:
        print(e)
        raise e


# logs user in database
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


# logs many users in database
def update_many_user_logs(users):

    try:
        user_logs, _ = (
            supabase.table("users").select("*").in_("username", users).execute()
        )

        user_logs_dict = {log["username"]: log for log in user_logs[1]}

        # prepares data for upsert
        upsert_data = []
        for user in users:
            if user in user_logs_dict:
                existing_log = user_logs_dict[user]
                upsert_data.append(
                    {
                        "username": user,
                        "count": existing_log["count"] + 1,
                        "last_used": datetime.now(tz=timezone.utc).isoformat(),
                        "first_used": existing_log["first_used"],
                    }
                )
            else:
                upsert_data.append(
                    {
                        "username": user,
                        "count": 1,
                        "last_used": datetime.now(tz=timezone.utc).isoformat(),
                        "first_used": datetime.now(tz=timezone.utc).isoformat(),
                    }
                )
        supabase.table("users").upsert(upsert_data).execute()
    except Exception as e:
        print(e)
        raise e


# deletes user from list of all users in database
def delete_user_log(user):

    try:
        supabase.table("users").delete().eq("username", user).execute()
    except Exception as e:
        print(e)
        raise e


# gets user's ratings from database
# not in use
def get_user_data(user):

    try:
        user_data, _ = (
            supabase.table("users").select("*").eq("username", user).execute()
        )
    except Exception as e:
        print(e)
        raise e

    return pd.DataFrame.from_records(user_data[1])


# updates user's ratings in database
# not in use
def update_user_data(user, user_df):

    user_records = user_df.to_dict(orient="records")
    for record in user_records:
        record["username"] = user

    try:
        supabase.table("user_ratings").upsert(user_records).execute()
    except Exception as e:
        print(e)
        raise e


# deletes user's ratings from database
# not in use
def delete_user_data(user):

    try:
        supabase.table("user_ratings").delete().eq("username", user).execute()
    except Exception as e:
        print(e)
        raise e


# gets table of movie urls from database
def get_movie_urls():

    try:
        movie_urls, _ = supabase.table("movie_urls").select("*").execute()
    except Exception as e:
        print(e)
        raise e

    return pd.DataFrame.from_records(movie_urls[1])


# updates table of movie urls in database
def update_movie_urls(urls_df):

    url_records = urls_df.to_dict(orient="records")

    try:
        supabase.table("movie_urls").upsert(url_records).execute()
    except Exception as e:
        print(e)
        raise e


# gets and processes the movie data from database
def get_movie_data():

    try:
        movie_data, _ = supabase.table("movie_data").select("*").execute()
        movie_data = pd.DataFrame.from_records(movie_data[1])
        return movie_data
    except Exception as e:
        print(e)
        raise e


# updates movie data in database
def update_movie_data(movie_data_df, local):

    try:
        if local:
            with sqlite3.connect("local_data.db") as conn:
                movie_data_df.to_sql(
                    "movie_data", conn, if_exists="replace", index=False
                )
                conn.commit()
        else:
            movie_records = movie_data_df.to_dict(orient="records")
            supabase.table("movie_data").upsert(movie_records).execute()
    except Exception as e:
        print(e)
        raise e


# gets movie genres from database
def get_movie_genres():
    try:
        movie_genres, _ = supabase.table("movie_genres").select("*").execute()
        movie_genres = pd.DataFrame.from_records(movie_genres[1])
        return movie_genres
    except Exception as e:
        print(e)
        raise e


# updates movie genres in database
def update_movie_genres(movie_genres_df, local):

    try:
        if local:
            with sqlite3.connect("local_data.db") as conn:
                movie_genres_df.to_sql(
                    "movie_genres", conn, if_exists="replace", index=False
                )
                conn.commit()
        else:
            movie_ids_to_update = movie_genres_df["movie_id"].unique()
            supabase.table("movie_genres").delete().in_(
                "movie_id", movie_ids_to_update.tolist()
            ).execute()
            genre_records = movie_genres_df.to_dict(orient="records")
            supabase.table("movie_genres").upsert(genre_records).execute()
    except Exception as e:
        print(e)
        raise e


# gets all user statistics from database
def get_all_user_statistics():

    try:
        statistics, _ = supabase.table("user_statistics").select("*").execute()
        return pd.DataFrame(statistics[1])
    except Exception as e:
        print(e)
        raise e


# updates user's statistics in database
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


def update_many_user_statistics(all_stats, batch_size):

    try:
        records = []
        for user in all_stats.keys():
            records.append(
                {
                    "username": user,
                    "mean_user_rating": all_stats[user]["user_rating"]["mean"],
                    "mean_letterboxd_rating": all_stats[user]["letterboxd_rating"][
                        "mean"
                    ],
                    "mean_letterboxd_rating_count": all_stats[user][
                        "letterboxd_rating_count"
                    ]["mean"],
                    "last_updated": datetime.now(tz=timezone.utc).isoformat(),
                }
            )

        success = 0
        fail = 0
        for i in range(0, len(records), batch_size):
            batch = records[i : i + batch_size]
            try:
                supabase.table("user_statistics").upsert(batch).execute()
                print(
                    f"\nsuccessfully updated batch {i // batch_size}'s statistics in database"
                )
                success += 1
            except:
                print(
                    f"\nfailed to update batch {i // batch_size}'s statistics in database"
                )
                fail += 1
        print(
            f"\nsucessfully updated {success} / {success + fail} statistics batches in database"
        )

    except Exception as e:
        print(e)
        raise e
