import os
import sys

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(project_root)

import data_processing.database as database


def main() -> None:

    # Gets usage metrics from database
    num_users, total_uses = database.get_usage_metrics()

    # Updates application metrics in database
    database.update_application_metrics(num_users=num_users, total_uses=total_uses)


if __name__ == "__main__":

    main()
