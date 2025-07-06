import json
import itertools
import os
import sys
from tqdm import tqdm


project_root = os.path.dirname((os.path.join(os.path.dirname(__file__), "../..")))
sys.path.append(project_root)

from model.general.train_general_model import train_general_model

if __name__ == "__main__":

    # Grid search parameters
    n_estimators_options = [50, 100, 200]
    max_depth_options = [None, 10, 20]
    min_samples_split_options = [2, 5, 10]

    # Performs grid search
    grid_search_results = []
    for n_estimators, max_depth, min_samples_split in tqdm(
        itertools.product(
            n_estimators_options, max_depth_options, min_samples_split_options
        ),
        total=len(n_estimators_options)
        * len(max_depth_options)
        * len(min_samples_split_options),
        desc="Performing general grid search",
    ):
        _, rmse_test, rounded_rmse_test, rmse_val, rounded_rmse_val = (
            train_general_model(
                n_estimators=n_estimators,
                max_depth=max_depth,
                min_samples_split=min_samples_split,
            )
        )

        # Stores results
        grid_search_results.append(
            {
                "n_estimators": n_estimators,
                "max_depth": max_depth,
                "min_samples_split": min_samples_split,
                "rmse_test": rmse_test,
                "rounded_rmse_test": rounded_rmse_test,
                "rmse_val": rmse_val,
                "rounded_rmse_val": rounded_rmse_val,
            }
        )

    # Saves grid search results
    save_path = "./general_grid_search_results.json"
    with open(save_path, "w") as f:
        json.dump(grid_search_results, f, indent=4)
        print(f"Saved grid search results to {save_path}")
