from functools import wraps
from flask import request, jsonify
import os
import sys
from typing import Literal

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(project_root)

from infra.rate_limiter import is_rate_limited


def rate_limit(
    service: Literal["recommendation", "recommendation_nlp", "statistics", "watchlist"],
    limit: int = 5,
    window_sec: int = 60,
):
    """
    Rate limit decorator for the backend server.

    Parameters
    ----------
        service (Literal["recommendation", "recommendation_nlp" "statistics", "watchlist"]): the service being rate-limited.
        limit (int): the rate limit.
        window_sec (int): the rate-limit window.
    """

    def decorator(f):
        @wraps(f)
        async def wrapped(*args, **kwargs):
            # Gets the IP address
            ip = request.remote_addr or "unknown"

            # Checks rate limit
            if await is_rate_limited(service, ip, limit, window_sec):
                return jsonify({"error": "Rate limit exceeded"}), 429

            return await f(*args, **kwargs)

        return wrapped

    return decorator
