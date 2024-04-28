# imports
import os
import sys

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(project_root)

import pandas as pd
import sqlite3

# global
movies_db_path = os.path.join(project_root, "data", "movies.db")
users_db_path = os.path.join(project_root, "data", "users.db")


# gets a list of all users in the database
def get_users_in_db():

    try:
        with sqlite3.connect(users_db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
            tables = cursor.fetchall()
            users = sorted([table[0] for table in tables])
    except Exception as e:
        print(e)
        raise e

    return users


# gets a user's ratings from the database
def get_user_data(user):

    query = f"SELECT * FROM {user}"

    try:
        with sqlite3.connect(users_db_path) as conn:
            df = pd.read_sql_query(query, conn)
    except Exception as e:
        print(e)
        raise e

    return df


# updates a user's ratings in the database
def update_user_ratings(user, user_df):

    try:
        with sqlite3.connect(users_db_path) as conn:
            user_df.to_sql(user, conn, if_exists="replace", index=False)
    except Exception as e:
        print(e)
        raise e


# deletes a user's ratings from the database
def delete_user_ratings(user):

    try:
        with sqlite3.connect(users_db_path) as conn:
            cursor = conn.cursor()
            cursor.execute(f"DROP TABLE IF EXISTS {user}")
    except Exception as e:
        print(e)
        raise e


# gets the table of movie urls in the database
def get_movie_urls():

    query = f"SELECT * FROM movie_urls"

    try:
        with sqlite3.connect(movies_db_path) as conn:
            df = pd.read_sql_query(query, conn)
    except Exception as e:
        print(e)
        raise e

    return df


# updates the table of movie urls in the database
def update_movie_urls(urls_df):

    try:
        with sqlite3.connect(movies_db_path) as conn:

            cursor = conn.cursor()
            cursor.execute(
                "SELECT name FROM sqlite_master WHERE type='table' AND name='movie_urls'"
            )
            table_exists = cursor.fetchone()

            if table_exists:
                current_urls = pd.read_sql("SELECT * FROM movie_urls", conn)
            else:
                current_urls = pd.DataFrame(columns=["movie_id", "title", "url"])

            updated_urls = pd.concat([current_urls, urls_df], ignore_index=True)
            updated_urls.drop_duplicates(subset="movie_id", inplace=True)
            updated_urls = updated_urls.sort_values(by="title").reset_index(drop=True)
            updated_urls.to_sql("movie_urls", conn, if_exists="replace", index=False)

            conn.commit()
    except Exception as e:
        print(e)
        raise e


# gets the movie data from the database
def get_movie_data():

    query = f"SELECT * FROM movie_data"

    try:
        with sqlite3.connect(movies_db_path) as conn:
            movie_data = pd.read_sql_query(query, conn)
    except Exception as e:
        print(e)
        raise e

    return movie_data


# updates the movie data in the database
def update_movie_data(movie_df):

    try:
        with sqlite3.connect(movies_db_path) as conn:
            movie_df.to_sql("movie_data", conn, if_exists="replace", index=False)
    except Exception as e:
        print(e)
        raise e


# updates the table of missing movie data in the database
def update_missing_urls(missing_df):

    try:
        with sqlite3.connect(movies_db_path) as conn:

            cursor = conn.cursor()
            cursor.execute(
                "SELECT name FROM sqlite_master WHERE type='table' AND name='missing_urls'"
            )
            table_exists = cursor.fetchone()

            if table_exists:
                current_missing = pd.read_sql("SELECT * FROM missing_urls", conn)
            else:
                current_missing = pd.DataFrame(columns=["movie_id", "title", "url"])

            updated_urls = pd.concat([current_missing, missing_df], ignore_index=True)
            updated_urls.drop_duplicates(subset="movie_id", inplace=True)
            updated_urls = updated_urls.sort_values(by="title").reset_index(drop=True)

            updated_urls.to_sql("missing_urls", conn, if_exists="replace", index=False)

            conn.commit()
    except Exception as e:
        print(e)
        raise e
