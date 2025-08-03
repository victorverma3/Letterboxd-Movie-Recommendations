import asyncio
from dotenv import load_dotenv
import json
from openai import OpenAI
import os
from typing import Any
import sys

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
sys.path.append(project_root)

from data_processing.utils import FilterParseException

load_dotenv()

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY"),
)

system_prompt = """
You are an assistant that generates movie recommendation filters based on a user's request. Each filter parameter will be a separate field in the response.

### IMPORTANT:
Format the response as the following JSON object. DO NOT include anything else in the response.

{
    "model_type": Literal["personalized"] = Field(description=Must be the string "personalized".),
    "genres": Sequence[str] = Field(description=A sequence of genres. Allowed values: "action", "adventure", "animation", "comedy", "crime", "documentary", "drama", "family", "fantasy", "history", "horror", "music", "mystery", "romance", "science_fiction", "tv_movie", "thriller", "war", "western". If unsure, include all genres except "music".),
    "content_types": Sequence[str] = Field(A sequence of content types. Allowed values: "movie", "tv". If unsure, use ["movie"].),
    "min_release_year": int = Field(description=An integer between 1880 and 2025 (inclusive). Must be less than or equal to max_release_year. If unsure, use 1920.),
    "max_release_year": int = Field(description=An integer between 1880 and the 2025 (inclusive). Must be greater than or equal to min_release_year. If unsure, use 2025.),
    "min_runtime": int = Field(description=An integer between 0 and 2000. Must be less than or equal to max_runtime. If unsure, use 0.),
    "max_runtime": int = Field(description=An integer between 5 and 2000. Must be greater than or equal to min_runtime. If unsure, use 1200.),
    "popularity": Literal[1,2,3,4,5,6] = Field(description=An integer describing the popularity of the movies. They values map as follows: 1 → top 100% of movies (most inclusive), 2 → top 70%, 3 → top 40%, 4 → top 20% (default), 5 → top 10%, 6 → top 5% (most popular only).)
}

This is an example response:

{
    "model_type": "personalized",
    "genres": ["action", "comedy"],
    "content_types": ["movie"],
    "min_release_year": 1980,
    "max_release_year": 2010,
    "min_runtime": 0,
    "max_runtime": 120,
    "popularity": 4
}
"""


async def generate_recommendation_filters(prompt: str) -> Any:

    completion = client.chat.completions.parse(
        extra_headers={
            "HTTP-Referer": "https://www.recommendations.victorverma.com/",
            "X-Title": "Letterboxd Movie Recommendations",
        },
        extra_body={},
        model="z-ai/glm-4.5-air:free",
        messages=[
            {"role": "system", "content": system_prompt},
            {
                "role": "user",
                "content": prompt,
            },
        ],
    )

    try:
        filters = json.loads(completion.choices[0].message.content)
    except:
        raise FilterParseException("Failed to parse filters from LLM response")

    return filters


async def main():

    # Gets the user's description
    prompt = input("Describe what you want to watch: ")

    # Generates recommendation filders
    print(await generate_recommendation_filters(prompt=prompt))


if __name__ == "__main__":

    asyncio.run(main())
