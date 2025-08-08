import os
import sys

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(project_root)

import data_processing.database as database


if __name__ == "__main__":

    # Gets usage metrics from database
    try:
        num_users, total_uses = database.get_usage_metrics()
    except:
        print("Failed to get usage metrics from database", file=sys.stderr)

    # Updates application metrics in database
    try:
        database.update_application_metrics(num_users=num_users, total_uses=total_uses)
    except:
        print("Failed to update application metrics", file=sys.stderr)
