# Imports
import os
import sys

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(project_root)

import data_processing.database as database


def main():

    # gets usage metrics from database
    num_users, total_uses = database.get_usage_metrics()

    # updates usage metrics in database
    database.update_usage_metrics(num_users, total_uses)


if __name__ == "__main__":

    main()
