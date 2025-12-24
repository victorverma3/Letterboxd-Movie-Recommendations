from collections import defaultdict
import numpy as np
import os
import pandas as pd
from shapely.geometry import Polygon
from sklearn.linear_model import Ridge
from sklearn.preprocessing import StandardScaler
import sys
from typing import Any, Dict, Hashable, Sequence

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(project_root)

from data_processing.utils import GENRES, get_processed_user_df
from infra.custom_exceptions import (
    UserProfileException,
)
from model.personalized_model import prepare_personalized_features


async def determine_compatibility(username_1: str, username_2: str) -> Dict[str, Any]:
    """
    Determines the compatibility of two Letterboxd profiles.
    """
    # Loads processed user dfs
    try:
        processed_username_1_df, _, _ = await get_processed_user_df(user=username_1)
        processed_username_2_df, _, _ = await get_processed_user_df(user=username_2)
    except UserProfileException as e:
        print(e, file=sys.stderr)
        raise e
    except Exception as e:
        print(e, file=sys.stderr)
        raise e

    # Calculates film compatibility score
    film_compatibility_score = calculate_film_compatibility_score(
        processed_user_1_df=processed_username_1_df,
        processed_user_2_df=processed_username_2_df,
    )

    # Calculates user genre means
    username_1_genre_means = calculate_genre_means(
        processed_user_df=processed_username_1_df
    )
    username_2_genre_means = calculate_genre_means(
        processed_user_df=processed_username_2_df
    )

    # Calculates genre compatibility score
    username_1_genre_values = [username_1_genre_means[genre] for genre in GENRES]
    username_2_genre_values = [username_2_genre_means[genre] for genre in GENRES]

    username_1_poly = Polygon(radar_to_cartesian(np.array(username_1_genre_values)))
    username_2_poly = Polygon(radar_to_cartesian(np.array(username_2_genre_values)))

    genre_compatibility_score = int(
        (
            username_1_poly.intersection(username_2_poly).area
            / username_1_poly.union(username_2_poly).area
        )
        * 100
    )

    # Gets shared watches
    shared_user_df = pd.merge(
        processed_username_1_df,
        processed_username_2_df,
        on=["movie_id", "url", "title", "poster", "release_year"],
        how="inner",
        suffixes=("_user_1", "_user_2"),
    )

    # Gets shared favorites
    shared_favorites = get_shared_favorites(shared_user_df=shared_user_df)

    # Gets polarizing watches
    polarizing_watches = get_polarizing_watches(shared_user_df=shared_user_df)

    compatibility = {
        "username_1": username_1,
        "username_2": username_2,
        "film_compatibility_score": film_compatibility_score,
        "genre_preferences": {
            username_1: username_1_genre_means,
            username_2: username_2_genre_means,
        },
        "genre_compatibility_score": genre_compatibility_score,
        "shared_favorites": shared_favorites,
        "polarizing_watches": polarizing_watches,
    }

    return compatibility


def calculate_film_compatibility_score(
    processed_user_1_df: pd.DataFrame, processed_user_2_df: pd.DataFrame
) -> float:
    """
    Calculates the film compatibility score of two Letterboxd profiles.
    """
    # Calculates preference vectors
    try:
        preference_vector_1 = calculate_preference_vector(
            processed_user_df=processed_user_1_df
        )
        preference_vector_2 = calculate_preference_vector(
            processed_user_df=processed_user_2_df
        )
    except Exception as e:
        print(e, file=sys.stderr)
        raise e

    # Calculates cosine similarity
    cosine_similarity = np.dot(preference_vector_1, preference_vector_2) / (
        np.linalg.norm(preference_vector_1) * np.linalg.norm(preference_vector_2)
    )

    # Scales cosine similarity from [-1, 1] to [0, 100]
    compatibility_score = int(((cosine_similarity + 1) / 2) * 100)

    return compatibility_score


def calculate_preference_vector(processed_user_df: pd.DataFrame) -> np.ndarray:
    """
    Calculates the user's preference vector.
    """
    # Prepares user feature data
    X = prepare_personalized_features(X=processed_user_df)

    # Creates user target data
    y = processed_user_df["user_rating"]

    # Scales features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Regularization strength
    n = len(y)
    if n < 20:
        alpha = 10.0
    elif n < 100:
        alpha = 3.0
    else:
        alpha = 1.0

    # Fits ridge regression
    model = Ridge(alpha=alpha)
    model.fit(X_scaled, y)

    # Normalizes preference vector
    w_u = model.coef_
    w_u = w_u / np.linalg.norm(w_u)

    return w_u


def calculate_genre_means(processed_user_df: pd.DataFrame) -> Dict[str, float]:
    """
    Calculates the mean rating for each genre.
    """
    # Calculates mean ratings
    genre_means = defaultdict(float)
    for genre in GENRES:
        temp = processed_user_df.loc[processed_user_df[f"is_{genre}"] == 1]
        genre_means[genre] = round(temp["user_rating"].mean(), 2)

    # Converts NaN values to 0
    for genre, mean in genre_means.items():
        if pd.isna(mean):
            genre_means[genre] = 0

    return genre_means


def radar_to_cartesian(values: np.ndarray) -> np.ndarray:
    """
    Converts radar points to cartesian coordinates.
    """
    # Creates evenly spaced angles
    n = len(values)
    angles = np.linspace(0, 2 * np.pi, n, endpoint=False)

    # Calculates cartesian coordinates
    x = values * np.cos(angles)
    y = values * np.sin(angles)

    return np.column_stack([x, y])


def get_shared_favorites(
    shared_user_df: pd.DataFrame,
) -> Sequence[Dict[Hashable, Any]] | None:
    """
    Gets movies both users rated 4.5 or higher on Letterboxd.
    """
    # Filters by both rated 4.5 or higher
    shared_favorites = shared_user_df[
        (shared_user_df["user_rating_user_1"] >= 4.5)
        & (shared_user_df["user_rating_user_2"] >= 4.5)
    ].copy()

    # No shared favorites
    if len(shared_favorites) == 0:
        return None

    # Calculates average rating for sorting
    shared_favorites["mean_user_rating"] = (
        shared_favorites["user_rating_user_1"] + shared_favorites["user_rating_user_2"]
    ) / 2

    # Keeps relevant columns
    shared_favorites = shared_favorites.sort_values(
        by="mean_user_rating", ascending=False
    )[
        [
            "poster",
            "url",
        ]
    ]

    return shared_favorites.to_dict(orient="records")


def get_polarizing_watches(
    shared_user_df: pd.DataFrame,
) -> Sequence[Dict[Hashable, Any]] | None:
    """
    Gets up to 12 movies both users rated most differently.
    """
    # Calculates rating differential for sorting
    shared_user_df["absolute_rating_differential"] = abs(
        shared_user_df["user_rating_user_1"] - shared_user_df["user_rating_user_2"]
    )

    # Filters polarizing watches
    polarizing_watches = shared_user_df[
        shared_user_df["absolute_rating_differential"] >= 2
    ]
    if len(polarizing_watches) == 0:
        return None

    # Keeps relevant columns
    polarizing_watches = polarizing_watches.sort_values(
        by="absolute_rating_differential", ascending=False
    )[["poster", "url", "user_rating_user_1", "user_rating_user_2"]].iloc[:12]

    return polarizing_watches.to_dict(orient="records")
