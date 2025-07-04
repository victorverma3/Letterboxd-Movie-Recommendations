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


def train_model(
    save_path: str = None,
    verbose: bool = False,
) -> Tuple[RandomForestRegressor, float, float, float, float]:

    # Loads training data
    global_training_data = pd.read_csv(
        "../../data/training/global/global_training_data.csv"
    )
    if verbose:
        print("Loaded global training data")

    # Creates feature and target data
    X = global_training_data.drop(columns=["user_rating"])
    y = global_training_data["user_rating"]

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
        random_state=0, max_depth=None, min_samples_split=10, n_estimators=100
    )

    # Fits recommendation model on user training data
    model.fit(X_train, y_train)
    if verbose:
        print("Trained global model")

    # Saves model to disk
    if save_path is not None:
        try:
            with open(save_path, "wb") as f:
                pickle.dump(model, f)
            if verbose:
                print("Saved global model to disk")

        except:
            raise ValueError("Global model save path is invalid")

    # Calculates mse on test data
    y_pred_test = model.predict(X_test)
    rmse_test = root_mean_squared_error(y_test, y_pred_test)
    rounded_rmse_test = root_mean_squared_error(y_test, np.round(y_pred_test * 2) / 2)

    # Calculates mse on validation data
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
    model, _, _, _, _ = train_model(save_path=args.save_path, verbose=args.verbose)

    finish = time.perf_counter()
    print(f"Trained global model in {finish - start} seconds")
