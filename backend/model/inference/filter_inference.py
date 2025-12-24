import asyncio
from dotenv import load_dotenv
from openai import OpenAI
import os
from pydantic import BaseModel
from typing import Literal, Sequence
import sys
import tiktoken

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
sys.path.append(project_root)

from infra.custom_exceptions import DescriptionLengthException, FilterParseException

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
    popularity: Sequence[str]
    highly_rated: bool
    include_watchlist: bool
    allow_rewatches: bool


system_prompt = """
You are an assistant capable of generating structured fields. You will be given a piece of text that describes what the user wants to watch. Your job is to create movie filters that best correspond to the provided description. Keep in mind that the filters you produce will be used to generate personalized movie recommendations for the user. Each filter parameter will be a separate field in the response.

These are the descriptions for each filter parameter:
- model_type: Must be the string "personalized".
- genres: A sequence of genres. Allowed values: "action", "adventure", "animation", "comedy", "crime", "documentary", "drama", "family", "fantasy", "history", "horror", "music", "mystery", "romance", "science_fiction", "tv_movie", "thriller", "war", "western". If unsure, include all genres except "music".
- content_types: A sequence of content types. Allowed values: "movie", "tv". If unsure, use ["movie"].
- min_release_year: An integer between 1880 and 2025 (inclusive). Must be less than or equal to max_release_year. If unsure, use 1920.
- max_release_year: An integer between 1880 and the 2025 (inclusive). Must be greater than or equal to min_release_year. If unsure, use 2025.
- min_runtime: An integer between 0 and 2000. Must be less than or equal to max_runtime. If unsure, use 0.
- max_runtime: An integer between 5 and 2000. Must be greater than or equal to min_runtime. If unsure, use 1200.
- popularity: A sequence of values describing the popularity of the movies. Allowed values: "low", "medium", "high". The values map as follows: "low" → 0th-33rd percentile, "medium" → 33rd-67th percentile, "high" → 67th-100th percentile. If unsure, use ["low", "medium", "high"].
- highly_rated: A boolean indicating if only highly rated movies should be considered. If unsure, use False.
- allow_rewatches: A boolean indicating if rewatches should be considered. If unsure, use False.
- include_watchlist: A boolean indiciating if movies on the user's watchlist should be included. If unsure, use True.
"""


async def generate_recommendation_filters(prompt: str) -> FilterExtraction:
    """
    Generates recommendation filters based on a user's description.

    Parameters
    ----------
    prompt (str):
        The user's description.

    Returns
    FilterExtraction:
        A pydantic model containing the recommendation filters.
    """
    # Verifies prompt length
    encoder = tiktoken.get_encoding(encoding_name="o200k_base")
    encoding = encoder.encode(text=prompt)

    if len(encoding) > 50:
        print("Description is too long", file=sys.stderr)
        raise DescriptionLengthException("Description is too long")

    # Gets the OpenAI API response
    response = client.responses.parse(
        model="gpt-5-nano",
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
        if filters is None:
            raise FilterParseException("Failed to parse filters from LLM response")
    except Exception as e:
        print(e, file=sys.stderr)
        raise FilterParseException("Failed to parse filters from LLM response")

    return filters


async def main():

    # Gets the user's description
    prompt = input("Describe what you want to watch: ")

    # Generates recommendation filders
    print(await generate_recommendation_filters(prompt=prompt))


if __name__ == "__main__":

    asyncio.run(main())
