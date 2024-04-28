import os
import sys

project_root = os.path.dirname(os.path.abspath(""))
sys.path.append(project_root)
import data_processing.database as database

if __name__ == "__main__":
    database.delete_data("../data/users.db", "pbreeck")
