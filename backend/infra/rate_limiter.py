from dotenv import load_dotenv
import os
import sys
import time
from typing import Literal
from upstash_redis import Redis

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(project_root)


load_dotenv()

redis = Redis(
    url=os.getenv("UPSTASH_REDIS_REST_URL"),
    token=os.getenv("UPSTASH_REDIS_REST_TOKEN"),
)


async def is_rate_limited(
    service: Literal["recommendation", "recommendation_nlp", "statistics", "watchlist"],
    ip: str,
    limit: int,
    window_sec: int,
) -> bool:
    """
    Determines if the user is rate-limited based on their IP address.

    Parameters
    ----------
        service (Literal["recommendation", "recommendation_nlp" "statistics", "watchlist"]): the service being rate-limited.
        ip (str): the IP address of the user.
        limit (int): the rate-limit.
        window_sec (int): the rate-limit window.
    """
    key = f"ratelimit:{ip}_{service}"
    now_ms = int(time.time() * 1000)
    window_ms = window_sec * 1000

    redis.zremrangebyscore(key, "-inf", now_ms - window_ms)
    count = redis.zcard(key)
    if count >= limit:
        return True

    redis.zadd(key, {str(now_ms): now_ms})
    redis.expire(key, window_sec)

    return False
