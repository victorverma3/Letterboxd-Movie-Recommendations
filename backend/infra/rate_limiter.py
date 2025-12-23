from dotenv import load_dotenv
import os
import sys
import time
from typing import Literal
from upstash_redis.asyncio import Redis

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(project_root)

RateLimitService = Literal[
    "recommendations",
    "recommendations_nlp",
    "recommendations_predictions",
    "statistics",
    "watchlist",
    "compatibility",
]


load_dotenv()

# Connects to Upstash Redis
redis_url = os.getenv("UPSTASH_REDIS_REST_URL", None)
redis_token = os.getenv("UPSTASH_REDIS_REST_TOKEN", None)

if redis_url is not None and redis_token is not None:
    redis = Redis(
        url=redis_url,
        token=redis_token,
    )
else:
    print("Missing Redis credentials", file=sys.stderr)


async def is_rate_limited(
    service: RateLimitService,
    ip: str,
    limit: int,
    window_sec: int,
) -> bool:
    """
    Determines if the user is rate-limited based on their IP address.

    Parameters
    ----------
        service (RateLimitService): the service being rate-limited.
        ip (str): the IP address of the user.
        limit (int): the rate limit.
        window_sec (int): the rate limit window.

    Returns
        bool: if the IP address is rate-limited.
    """
    key = f"ratelimit:{ip}:{service}:{window_sec}"
    now_ms = int(time.time() * 1000)
    window_ms = window_sec * 1000

    await redis.zremrangebyscore(key, "-inf", now_ms - window_ms)
    count = await redis.zcard(key)
    if count >= limit:
        return True

    await redis.zadd(key, {str(now_ms): now_ms})
    await redis.expire(key, window_sec)

    return False
