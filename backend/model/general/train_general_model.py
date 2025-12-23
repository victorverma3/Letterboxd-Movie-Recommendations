import argparse
import numpy as np
import os
import pandas as pd
import pickle
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import root_mean_squared_error
from sklearn.model_selection import train_test_split
import sys
import time
from typing import Tuple

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
sys.path.append(project_root)


def train_general_model(
    n_estimators: int,
    max_depth: int,
    min_samples_split: int,
    save_path: str | None = None,
    verbose: bool = False,
) -> Tuple[RandomForestRegressor, float, float, float, float]:
    """
    Trains general model.
    """

    # Loads training data
    general_training_data = pd.read_csv(
        "../../data/training/general/general_training_data.csv"
    )
    if verbose:
        print("Loaded general training data")

    # Creates feature and target data
    X = general_training_data.drop(columns=["user_rating"])
    y = general_training_data["user_rating"]

    # Creates train-test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=0
    )

    # Creates test-validation split
    X_test, X_val, y_test, y_val = train_test_split(
        X_test, y_test, test_size=0.5, random_state=0
    )

    # Initializes model
    model = RandomForestRegressor(
        random_state=0,
        n_estimators=n_estimators,
        max_depth=max_depth,
        min_samples_split=min_samples_split,
    )

    # Fits recommendation model on user training data
    model.fit(X_train, y_train)
    if verbose:
        print("Trained general model")

    # Saves model to disk
    if save_path is not None:
        try:
            with open(save_path, "wb") as f:
                pickle.dump(model, f)
            if verbose:
                print(f"Saved general model to {save_path}")

        except:
            raise ValueError("General model save path is invalid")

    # Calculates rmse on test data
    y_pred_test = model.predict(X_test)
    rmse_test = root_mean_squared_error(y_test, y_pred_test)
    rounded_rmse_test = root_mean_squared_error(y_test, np.round(y_pred_test * 2) / 2)

    # Calculates rmse on validation data
    y_pred_val = model.predict(X_val)
    rmse_val = root_mean_squared_error(y_val, y_pred_val)
    rounded_rmse_val = root_mean_squared_error(y_val, np.round(y_pred_val * 2) / 2)

    # Prints accuracy evaluation values
    if verbose:
        print("Test RMSE:", rmse_test)
        print("Rounded test RMSE:", rounded_rmse_test)
        print("Validation RMSE:", rmse_val)
        print("Rounded validation RMSE:", rounded_rmse_val)

    return model, rmse_test, rounded_rmse_test, rmse_val, rounded_rmse_val


if __name__ == "__main__":

    parser = argparse.ArgumentParser()

    # N estimators
    parser.add_argument(
        "-n",
        "--n-estimators",
        type=int,
        default=10,
        help="Number of decision trees.",
    )

    # Max depth
    parser.add_argument(
        "-md",
        "--max-depth",
        type=int,
        default=None,
        help="Maximum depth of a decision tree.",
    )

    # Minimum samples split
    parser.add_argument(
        "-mss",
        "--min-samples-split",
        type=int,
        default=10,
        help="Minimum number of samples to split an internal node.",
    )

    # Model save path
    parser.add_argument(
        "-sp",
        "--save_path",
        help="Model save path.",
    )

    # Verbose
    parser.add_argument(
        "-v", "--verbose", help="The verbosity of the model.", action="store_true"
    )

    args = parser.parse_args()

    start = time.perf_counter()

    # Trains global recommendation model
    model, _, _, _, _ = train_general_model(
        n_estimators=args.n_estimators,
        max_depth=args.max_depth,
        min_samples_split=args.min_samples_split,
        save_path=args.save_path,
        verbose=args.verbose,
    )

    finish = time.perf_counter()
    print(f"Trained general model in {finish - start} seconds")
