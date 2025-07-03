from datetime import datetime, timezone
from dotenv import load_dotenv
from functools import lru_cache
import os
import pandas as pd
import sqlite3
from supabase import create_client, Client
from tqdm import tqdm
from typing import Any, Dict, Sequence, Tuple

from data_processing.utils import process_genres

load_dotenv()

SUPABASE_MAX_ROWS = 100000

# Initializes supabase
try:
    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_KEY")
    supabase: Client = create_client(supabase_url, supabase_key)
except Exception as e:
    print("\nFailed to connect to Supabase: ", e)


# Gets table size
def get_table_size(table_name: str) -> int:

    response = supabase.table(table_name).select("*", count="exact").limit(1).execute()

    return response.count


# Gets list of all users from database
def get_user_list() -> Sequence[str]:

    try:
        users, _ = supabase.table("users").select("username").execute()
    except Exception as e:
        print(e)
        raise e

    return sorted([user["username"] for user in users[1]])


# Gets list of all statistics users from database
def get_statistics_user_list() -> Sequence[str]:

    try:
        users, _ = supabase.table("user_statistics").select("username").execute()

        return sorted([user["username"] for user in users[1]])
    except Exception as e:
        print(e)
        raise e


# Gets a user's log from database
# NOTE Not in use
def get_user_log(user: str) -> pd.DataFrame:

    try:
        user_data, _ = (
            supabase.table("users").select("*").eq("username", user).execute()
        )
    except Exception as e:
        print(e)
        raise e

    return pd.DataFrame.from_records(user_data[1])


# Logs user in database
def update_user_log(user: str) -> None:

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


# Logs many users in database
def update_many_user_logs(users: Sequence[str]) -> None:

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


# Deletes user from database
def delete_user_log(user: str) -> None:

    try:
        supabase.table("users").delete().eq("username", user).execute()
    except Exception as e:
        print(e)
        raise e


# Gets user ratings from database
def get_user_ratings(batch_size=SUPABASE_MAX_ROWS) -> pd.DataFrame:

    # Loads local file if exists
    if os.path.exists("../data/global_user_ratings.csv"):

        return pd.read_csv("../data/global_user_ratings.csv")

    table_size = get_table_size(table_name="user_ratings")
    all_user_ratings = []
    for offset in tqdm(
        range(0, table_size, batch_size), desc="Retrieving user ratings from database"
    ):
        try:
            response = (
                supabase.table("user_ratings")
                .select("*")
                .range(offset, offset + batch_size)
                .execute()
            )

            if response:
                all_user_ratings.extend(response.data)
        except Exception as e:
            print(e)
            raise e

    global_user_ratings = pd.DataFrame.from_records(all_user_ratings)

    # Stores local file
    global_user_ratings.to_csv("../data/global_user_ratings.csv", index=False)

    return global_user_ratings


# Updates user's ratings in database
def update_user_ratings(user_df: pd.DataFrame) -> None:

    user_records = user_df.to_dict(orient="records")

    try:
        supabase.table("user_ratings").upsert(user_records).execute()
    except Exception as e:
        print(e)
        raise e


# Deletes user's ratings from database
def delete_user_ratings(user: str) -> None:

    try:
        supabase.table("user_ratings").delete().eq("username", user).execute()
    except Exception as e:
        print(e)
        raise e


# Gets movie urls from database
def get_movie_urls(batch_size=SUPABASE_MAX_ROWS) -> pd.DataFrame:

    table_size = get_table_size(table_name="movie_urls")
    all_movie_urls = []
    for offset in tqdm(
        range(0, table_size, batch_size), desc="Retrieving movie urls from database"
    ):
        try:
            response = (
                supabase.table("movie_urls")
                .select("*")
                .range(offset, offset + batch_size)
                .execute()
            )

            if response:
                all_movie_urls.extend(response.data)
        except Exception as e:
            print(e)
            raise e

    return pd.DataFrame.from_records(all_movie_urls)


# Updates movie urls in database
def update_movie_urls(urls_df: pd.DataFrame) -> None:

    url_records = urls_df.to_dict(orient="records")

    try:
        supabase.table("movie_urls").upsert(url_records).execute()
    except Exception as e:
        print(e)
        raise e


# Gets movie data from cache or database
@lru_cache(maxsize=1)
def get_movie_data_cached() -> Tuple:
    try:
        # Loads movie data
        movie_data, _ = supabase.table("movie_data").select("*").execute()
        movie_data = pd.DataFrame(movie_data[1])

        # Processes movie data
        genre_columns = movie_data[["genres"]].apply(
            process_genres, axis=1, result_type="expand"
        )
        movie_data = pd.concat([movie_data, genre_columns], axis=1)
        movie_data["url"] = movie_data["url"].astype("string")
        movie_data["title"] = movie_data["title"].astype("string")
        movie_data["poster"] = movie_data["poster"].astype("string")

        return tuple(movie_data.to_dict("records"))
    except Exception as e:
        print(e)
        raise e


# Gets movie data
def get_movie_data() -> pd.DataFrame:

    return pd.DataFrame.from_records(get_movie_data_cached())


# Gets raw movie data from database
def get_raw_movie_data() -> pd.DataFrame:
    try:
        # Loads movie data
        movie_data, _ = supabase.table("movie_data").select("*").execute()
        movie_data = pd.DataFrame(movie_data[1])

        # Processes movie data
        movie_data["url"] = movie_data["url"].astype("string")
        movie_data["title"] = movie_data["title"].astype("string")
        movie_data["poster"] = movie_data["poster"].astype("string")

        return movie_data
    except Exception as e:
        print(e)
        raise e


# Updates movie data in database
def update_movie_data(movie_data_df: pd.DataFrame, local: bool) -> None:

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


# Gets all user statistics from database
def get_all_user_statistics() -> pd.DataFrame:

    try:
        statistics, _ = supabase.table("user_statistics").select("*").execute()

        return pd.DataFrame(statistics[1])
    except Exception as e:
        print(e)
        raise e


# Updates a user's statistics in database
def update_user_statistics(user: str, user_stats: Dict[str, Any]) -> None:

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


# Updates multiple user's statistics in database
def update_many_user_statistics(
    all_stats: Dict[str, Dict[str, Any]], batch_size: int
) -> None:

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
                    f"\nSuccessfully updated batch {i // batch_size}'s statistics in database"
                )
                success += 1
            except:
                print(
                    f"\nFailed to update batch {i // batch_size}'s statistics in database"
                )
                fail += 1
        print(
            f"\nSuccessfully updated {success} / {success + fail} statistics batches in database"
        )
    except Exception as e:
        print(e)
        raise e


# Gets application usage metrics from database
def get_usage_metrics() -> Tuple[int, int]:

    try:
        counts, _ = supabase.table("users").select("username", "count").execute()

        total_uses = sum(
            count["count"]
            for count in counts[1]
            if count["username"]
            not in ["victorverma", "jconn8", "hzielinski", "rohankumar", "hgrosse"]
        )
        num_users = len(counts[1])

        return num_users, total_uses
    except Exception as e:
        print(e)
        raise e


# Gets application metrics from database
def get_application_metrics() -> Sequence[Dict[str, Any]]:

    try:
        metrics, _ = (
            supabase.table("application_metrics").select("*").order("date").execute()
        )

        return metrics[1]
    except Exception as e:
        print(e)
        raise e


# Updates application metrics in database
def update_application_metrics(num_users: int, total_uses: int) -> None:

    try:
        supabase.table("application_metrics").upsert(
            {
                "date": datetime.now().date().isoformat(),
                "num_users": num_users,
                "total_uses": total_uses,
            }
        ).execute()
        print(f"\nSuccessfully updated application metrics in database")
    except Exception as e:
        print(e)
        raise e
