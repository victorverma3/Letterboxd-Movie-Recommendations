from functools import wraps
from flask import abort, current_app, request
import os
import sys
from typing import Literal, Sequence

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(project_root)

from infra.rate_limiter import is_rate_limited


def rate_limit(
    service: Literal[
        "recommendations", "recommendations_nlp", "statistics", "watchlist"
    ],
    rate_limits: Sequence[tuple[int, int]],
):
    """
    Rate limit decorator for the backend server.

    Parameters
    ----------
        service (Literal["recommendation", "recommendation_nlp" "statistics", "watchlist"]): the service being rate-limited.
        rate_limits (Sequence[tuple[int, int]]): a list of (limit, window_sec) rate limit pairs.
    """

    def decorator(f):
        @wraps(f)
        async def wrapped(*args, **kwargs):
            # Ignores rate-limiting during testing
            if current_app.config.get("TESTING"):
                return await f(*args, **kwargs)

            # Gets the IP address
            ip = request.remote_addr or "unknown"

            # Checks rate limit pairs
            for limit, window_sec in rate_limits:
                if await is_rate_limited(
                    service=service, ip=ip, limit=limit, window_sec=window_sec
                ):
                    if window_sec == 60:
                        abort(code=429, description="Minute rate limit exceeded")
                    elif window_sec == 3600:
                        abort(code=429, description="Hourly rate limit exceeded")
                    elif window_sec == 86400:
                        abort(code=429, description="Daily rate limit exceeded")
                    else:
                        return abort(
                            code=429,
                            description=f"{window_sec}-second rate limit exceeded",
                        )

            return await f(*args, **kwargs)

        return wrapped

    return decorator
