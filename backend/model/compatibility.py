import numpy as np
import os
from sklearn.linear_model import Ridge
from sklearn.preprocessing import StandardScaler
import sys
from typing import Any

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(project_root)

from data_processing.utils import get_processed_user_df
from infra.custom_exceptions import (
    UserProfileException,
)
from model.personalized_model import prepare_personalized_features


async def determine_compatibility(username_1: str, username_2: str) -> dict[str, Any]:
    """
    Determines the compatibility of two Letterboxd profiles.
    """
    # Calculates preference vectors
    try:
        preference_vector_1 = await calculate_preference_vector(username=username_1)
        preference_vector_2 = await calculate_preference_vector(username=username_2)
    except UserProfileException as e:
        print(e, file=sys.stderr)
        raise e
    except Exception as e:
        print(e, file=sys.stderr)
        raise e

    # Calculates cosine similarity
    cosine_similarity = np.dot(preference_vector_1, preference_vector_2) / (
        np.linalg.norm(preference_vector_1) * np.linalg.norm(preference_vector_2)
    )

    # Scales cosine similarity from [-1, 1] to [0, 100]
    compatibility_score = int(((cosine_similarity + 1) / 2) * 100)

    compatibility = {
        "username_1": username_1,
        "username_2": username_2,
        "compatibility_score": compatibility_score,
    }

    return compatibility


async def calculate_preference_vector(username: str) -> np.ndarray:
    """
    Calculates the user's preference vector.
    """
    # Loads processed user df
    try:
        processed_user_df, _, _ = await get_processed_user_df(user=username)
    except UserProfileException as e:
        print(e, file=sys.stderr)
        raise e
    except Exception as e:
        print(e, file=sys.stderr)
        raise e

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
