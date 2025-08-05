import asyncio
from dotenv import load_dotenv
from openai import OpenAI
import os
from pydantic import BaseModel
from typing import Literal, Sequence
import sys

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
sys.path.append(project_root)

from data_processing.utils import FilterParseException

load_dotenv()

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
)


class FilterExtraction(BaseModel):
    model_type: Literal["personalized"]
    genres: Sequence[str]
    content_types: Sequence[str]
    min_release_year: int
    max_release_year: int
    min_runtime: int
    max_runtime: int
    popularity: Literal[1, 2, 3, 4, 5, 6]


system_prompt = """
You are an assistant that generates movie recommendation filters based on a user's request. Each filter parameter will be a separate field in the response.

These are the descriptions for each field:
- model_type: Must be the string "personalized".
- genres: A sequence of genres. Allowed values: "action", "adventure", "animation", "comedy", "crime", "documentary", "drama", "family", "fantasy", "history", "horror", "music", "mystery", "romance", "science_fiction", "tv_movie", "thriller", "war", "western". If unsure, include all genres except "music".
- content_types: A sequence of content types. Allowed values: "movie", "tv". If unsure, use ["movie"].
- min_release_year: An integer between 1880 and 2025 (inclusive). Must be less than or equal to max_release_year. If unsure, use 1920.
- max_release_year: An integer between 1880 and the 2025 (inclusive). Must be greater than or equal to min_release_year. If unsure, use 2025.
- min_runtime: An integer between 0 and 2000. Must be less than or equal to max_runtime. If unsure, use 0.
- max_runtime: An integer between 5 and 2000. Must be greater than or equal to min_runtime. If unsure, use 1200.
- popularity: An integer describing the popularity of the movies. The values map as follows: 1 → top 100% of movies (most inclusive), 2 → top 70%, 3 → top 40%, 4 → top 20% (default), 5 → top 10%, 6 → top 5% (most popular only)
"""


async def generate_recommendation_filters(prompt: str) -> FilterExtraction:
    """
    Generates recommendation filters based on a user's description.

    Parameters
    ----------
        prompt (str): The user's description.

    Returns
        FilterExtraction: A pydantic model containing the recommendation filters.
    """
    # Gets the OpenAI API response
    response = client.responses.parse(
        model="gpt-4.1-nano-2025-04-14",
        input=[
            {"role": "system", "content": system_prompt},
            {
                "role": "user",
                "content": prompt,
            },
        ],
        text_format=FilterExtraction,
    )

    try:
        filters = response.output_parsed
    except Exception as e:
        print(e)
        raise FilterParseException("Failed to parse filters from LLM response")

    return filters


async def main():

    # Gets the user's description
    prompt = input("Describe what you want to watch: ")

    # Generates recommendation filders
    print(await generate_recommendation_filters(prompt=prompt))


if __name__ == "__main__":

    asyncio.run(main())
