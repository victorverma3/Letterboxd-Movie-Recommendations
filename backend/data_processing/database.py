from datetime import datetime, timezone
from dotenv import load_dotenv
from functools import lru_cache
import os
import pandas as pd
from supabase import create_client
import sys
from tqdm import tqdm
from typing import Any, Dict, Sequence, Tuple

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(project_root)


load_dotenv()

SUPABASE_MAX_ROWS = 100000

# Initializes Supabase
try:
    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_KEY")
    supabase = create_client(supabase_url, supabase_key)
except Exception as e:
    print(e, file=sys.stderr)
    print("Failed to connect to Supabase", file=sys.stderr)


def get_table_size(table_name: str) -> int:
    """
    Gets Supabase table size.
    """
    try:
        response = (
            supabase.table(table_name).select("*", count="exact").limit(1).execute()
        )

        return response.count
    except Exception as e:
        print(e, file=sys.stderr)
        raise e


def get_user_list() -> Sequence[str]:
    """
    Gets list of all users from database.
    """
    try:
        users, _ = supabase.table("users").select("username").execute()

        return sorted([user["username"] for user in users[1]])
    except Exception as e:
        print(e, file=sys.stderr)
        raise e


def get_statistics_user_list() -> Sequence[str]:
    """
    Gets list of all statistics users from database.
    """
    try:
        users, _ = supabase.table("user_statistics").select("username").execute()

        return sorted([user["username"] for user in users[1]])
    except Exception as e:
        print(e, file=sys.stderr)
        raise e


# NOTE Not in use
def get_user_log(user: str) -> pd.DataFrame:
    """
    Gets a user's log from database.
    """
    try:
        user_data, _ = (
            supabase.table("users").select("*").eq("username", user).execute()
        )

        return pd.DataFrame.from_records(user_data[1])
    except Exception as e:
        print(e, file=sys.stderr)
        raise e


def update_user_log(user: str) -> None:
    """
    Logs user in database.
    """
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
        print(e, file=sys.stderr)
        raise e


def update_many_user_logs(users: Sequence[str]) -> None:
    """
    Logs many users in database.
    """
    try:
        user_logs, _ = (
            supabase.table("users").select("*").in_("username", users).execute()
        )
        user_logs_dict = {log["username"]: log for log in user_logs[1]}

        # Prepares data for upsert
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
        print(e, file=sys.stderr)
        raise e


def delete_user_log(user: str) -> None:
    """
    Deletes user from database.
    """
    try:
        supabase.table("users").delete().eq("username", user).execute()
    except Exception as e:
        print(e, file=sys.stderr)
        raise e


def get_user_ratings(batch_size: int = SUPABASE_MAX_ROWS) -> pd.DataFrame:
    """
    Gets user ratings from database.
    """
    # Gets ratings table size
    try:
        table_size = get_table_size(table_name="user_ratings")
    except Exception as e:
        print(e, file=sys.stderr)
        raise e

    # Iterates through ratings table
    all_user_ratings = []
    try:
        for offset in tqdm(
            range(0, table_size, batch_size), desc="Loading user ratings from database"
        ):
            response = (
                supabase.table("user_ratings")
                .select("*")
                .range(offset, offset + batch_size)
                .execute()
            )

            # Aggregates ratings
            if response:
                all_user_ratings.extend(response.data)

        all_user_ratings = pd.DataFrame.from_records(all_user_ratings)

        return all_user_ratings
    except Exception as e:
        print(e, file=sys.stderr)
        raise e


def update_user_ratings(user_df: pd.DataFrame) -> None:
    """
    Updates user's ratings in database.
    """
    try:
        user_records = user_df.to_dict(orient="records")
        supabase.table("user_ratings").upsert(user_records).execute()
    except Exception as e:
        print(e, file=sys.stderr)
        raise e


def delete_user_ratings(user: str) -> None:
    """
    Deletes user's ratings from database.
    """
    try:
        supabase.table("user_ratings").delete().eq("username", user).execute()
    except Exception as e:
        print(e, file=sys.stderr)
        raise e


def get_movie_urls(batch_size=SUPABASE_MAX_ROWS) -> pd.DataFrame:
    """
    Gets movie urls from database.
    """
    # Gets table size
    try:
        table_size = get_table_size(table_name="movie_urls")
    except Exception as e:
        print(e, file=sys.stderr)
        raise e

    # Iterates through URLs table
    all_movie_urls = []
    try:
        for offset in tqdm(
            range(0, table_size, batch_size), desc="Loading movie urls from database"
        ):
            response = (
                supabase.table("movie_urls")
                .select("*")
                .range(offset, offset + batch_size)
                .execute()
            )

            # Aggregates URLs
            if response:
                all_movie_urls.extend(response.data)
    except Exception as e:
        print(e, file=sys.stderr)
        raise e

    df = pd.DataFrame.from_records(all_movie_urls)

    # Makes sure 'is_deprecated' column exists
    if "is_deprecated" not in df.columns:
        df["is_deprecated"] = False

    return df


def mark_movie_urls_deprecated(deprecated_df: pd.DataFrame) -> None:
    """
    Marks movie urls as deprecated in database.
    """
    # Checks if the DataFrame is empty
    if deprecated_df.empty:

        return

    try:
        # Ensures the DataFrame has the necessary columns
        records_to_update = [
            {"movie_id": row["movie_id"], "url": row["url"], "is_deprecated": True}
            for _, row in deprecated_df.iterrows()
        ]

        # Marks URLs as deprecated
        supabase.table("movie_urls").upsert(records_to_update).execute()
    except Exception as e:
        print(e, file=sys.stderr)
        raise e


def update_movie_urls(urls_df: pd.DataFrame) -> None:
    """
    Updates movie urls in database.
    """
    try:
        url_records = urls_df.to_dict(orient="records")
        supabase.table("movie_urls").upsert(url_records).execute()
    except Exception as e:
        print(e, file=sys.stderr)
        raise e


@lru_cache(maxsize=1)
def get_movie_data_cached() -> Tuple:
    """
    Gets movie data from cache or database.
    """
    from data_processing.utils import process_genres

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
        print(e, file=sys.stderr)
        raise e


def get_movie_data() -> pd.DataFrame:
    """
    Gets movie data.
    """
    return pd.DataFrame.from_records(get_movie_data_cached())


def get_raw_movie_data() -> pd.DataFrame:
    """
    Gets raw movie data from database.
    """
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
        print(e, file=sys.stderr)
        raise e


def update_movie_data(movie_data_df: pd.DataFrame) -> None:
    """
    Updates movie data in database.
    """
    try:
        movie_records = movie_data_df.to_dict(orient="records")
        supabase.table("movie_data").upsert(movie_records).execute()
    except Exception as e:
        print(e, file=sys.stderr)
        raise e


def get_all_user_statistics() -> pd.DataFrame:
    """
    Gets all user statistics from database.
    """
    try:
        statistics, _ = supabase.table("user_statistics").select("*").execute()

        return pd.DataFrame(statistics[1])
    except Exception as e:
        print(e, file=sys.stderr)
        raise e


def update_user_statistics(user: str, user_stats: Dict[str, Any]) -> None:
    """
    Updates a user's statistics in database.
    """
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
        print(e, file=sys.stderr)
        raise e


def update_many_user_statistics(
    all_stats: Dict[str, Dict[str, Any]], batch_size: int
) -> None:
    """
    Updates multiple user's statistics in database.
    """
    # Aggregates statistics
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
    except Exception as e:
        print(e, file=sys.stderr)
        raise e

    # Aggregates successful updates
    success = 0
    fail = 0
    for i in range(0, len(records), batch_size):
        batch = records[i : i + batch_size]
        # Updates records in database
        try:
            supabase.table("user_statistics").upsert(batch).execute()
            print(
                f"Successfully updated batch {i // batch_size}'s statistics in database"
            )
            success += 1
        except Exception as e:
            print(e, file=sys.stderr)
            print(
                f"Failed to update batch {i // batch_size}'s statistics in database",
                file=sys.stderr,
            )
            fail += 1
    print(
        f"Successfully updated {success} / {success + fail} statistics batches in database"
    )


def get_usage_metrics() -> Tuple[int, int]:
    """
    Gets application usage metrics from database.
    """
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
        print(e, file=sys.stderr)
        raise e


def get_application_metrics() -> Sequence[Dict[str, Any]]:
    """
    Gets application metrics from database.
    """
    try:
        metrics, _ = (
            supabase.table("application_metrics").select("*").order("date").execute()
        )

        return metrics[1]
    except Exception as e:
        print(e, file=sys.stderr)
        raise e


def update_application_metrics(num_users: int, total_uses: int) -> None:
    """
    Updates application metrics in database.
    """
    try:
        supabase.table("application_metrics").upsert(
            {
                "date": datetime.now().date().isoformat(),
                "num_users": num_users,
                "total_uses": total_uses,
            }
        ).execute()
        print(f"Successfully updated application metrics in database")
    except Exception as e:
        print(e, file=sys.stderr)
        raise e
