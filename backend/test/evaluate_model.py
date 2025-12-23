import argparse
import asyncio
import matplotlib.pyplot as plt
import os
import pandas as pd
import seaborn as sns
import sys
from typing import Literal, Tuple

project_root = os.path.dirname((os.path.join(os.path.dirname(__file__), "../..")))
sys.path.append(project_root)

from data_processing.utils import (
    get_processed_user_df,
)
from model.personalized_model import train_personalized_model


async def evaluate_model(
    user: str, model_type: Literal["personalized", "collaborative"]
) -> Tuple[int, float, float, float, float]:
    """
    Evaluates model.
    """

    # Loads processed user df, unrated movies, and movie data
    processed_user_df, _, _ = await get_processed_user_df(user=user, update_urls=False)

    # Trains recommendation model on processed user data
    if model_type == "personalized":
        _, rmse_test, rounded_rmse_test, rmse_val, rounded_rmse_val = (
            train_personalized_model(user_df=processed_user_df)
        )

    return (
        len(processed_user_df),
        rmse_test,
        rounded_rmse_test,
        rmse_val,
        rounded_rmse_val,
    )


def plot_rmse_values(
    accuracy_df: pd.DataFrame,
    model_type: Literal["personalized", "collaborative"],
):
    """
    Plots rmse values.
    """

    plt.figure(figsize=(10, 6))

    sns.lineplot(
        data=accuracy_df, x="num_rated", y="rmse_test", label="RMSE Test", marker="s"
    )
    sns.lineplot(
        data=accuracy_df,
        x="num_rated",
        y="rounded_rmse_test",
        label="Rounded RMSE Test",
        marker="D",
    )
    sns.lineplot(
        data=accuracy_df, x="num_rated", y="rmse_val", label="RMSE Val", marker="^"
    )
    sns.lineplot(
        data=accuracy_df,
        x="num_rated",
        y="rounded_rmse_val",
        label="Rounded RMSE Val",
        marker="v",
    )

    plt.xlabel("Number of Rated Movies")
    plt.ylabel("Root Mean Squared Error")
    plt.title(f"{model_type.title()} Model RMSE")
    plt.legend()
    plt.grid(True)
    plt.savefig(f"./figures/rmse_plot_{model_type}.png")


async def main(
    users: str,
    model_type: Literal["personalized", "collaborative"],
) -> None:

    user_list = users.split(",")

    # Evaluates  model
    tasks = [evaluate_model(user=user, model_type=model_type) for user in user_list]
    metrics = await asyncio.gather(*tasks)

    # Plots rmse values
    accuracy_df = pd.DataFrame(
        metrics,
        columns=[
            "num_rated",
            "rmse_test",
            "rounded_rmse_test",
            "rmse_val",
            "rounded_rmse_val",
        ],
    )
    plot_rmse_values(accuracy_df=accuracy_df, model_type=model_type)


if __name__ == "__main__":

    parser = argparse.ArgumentParser()

    # Model type
    parser.add_argument(
        "-m",
        "--model-type",
        choices=["personalized", "collaborative"],
        default="personalized",
        help="Choose the recommendation model to use.",
    )

    # Users whose watchlist to scrape
    parser.add_argument(
        "-u",
        "--users",
        default="harryzielinski,hgrosse,jconn8,kishkes88,kmorrow16,media_scouting,rohankumar,tmarro13,victorverma,zachrichards",
        help="The users on whom the model is evaluated. If including multiple users, format the input as a single comma-delimited string.",
    )

    args = parser.parse_args()

    asyncio.run(main(users=args.users, model_type=args.model_type))
