import argparse
import re


# Checks that num_movies is a valid argument
def check_num_movies_argument_type(value: str) -> str | int:

    if value == "all":

        return value
    try:
        value = int(value)
        if value < 1:
            raise argparse.ArgumentTypeError(
                '--num_movies (-n) argument must be a positive integer or "all"'
            )

        return value
    except ValueError:
        raise argparse.ArgumentTypeError(
            '--num_movies (-n) argument must be a positive integer or "all"'
        )
