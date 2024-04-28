import os
import sys

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(project_root)
import data_processing.database as database

if __name__ == "__main__":
    # database.delete_user_ratings("hgrosse")
    # print(database.get_users_in_db())
    print()
