import asyncio
from dotenv import load_dotenv
from flask import abort, current_app, Flask, jsonify, Response, request
from flask_cors import CORS
import json
import os
import sys
import time
from werkzeug.exceptions import (
    BadRequest,
    GatewayTimeout,
    InternalServerError,
    NotAcceptable,
    TooManyRequests,
    Unauthorized,
)
from werkzeug.middleware.proxy_fix import ProxyFix

project_root = os.path.abspath(os.path.dirname(__file__))
sys.path.append(project_root)

from data_processing import database
from data_processing.calculate_user_statistics import (
    get_user_percentiles,
    get_user_statistics,
)
from data_processing.compatibility import determine_compatibility
from data_processing.utils import (
    get_user_dataframe,
)
from data_processing.watchlist_picks import get_user_watchlist_picks
from infra.custom_exceptions import (
    DescriptionLengthException,
    FilterParseException,
    PredictionListException,
    RecommendationFilterException,
    UserProfileException,
    WatchlistEmptyException,
    WatchlistOverlapException,
)
from infra.custom_decorators import rate_limit
from model.inference.filter_inference import generate_recommendation_filters
from model.recommender import merge_recommendations, predict_movies, recommend_n_movies


load_dotenv()

app = Flask(__name__)
cors = CORS(app, origins="*")
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_port=1)


@app.errorhandler(400)
def bad_request_handler(error: BadRequest) -> Response:
    """
    Error handler for HTTP status 400.
    """
    response_body = {
        "success": False,
        "message": error.description or "Bad request",
    }

    return jsonify(response_body), 400


@app.errorhandler(401)
def unauthorized_handler(error: Unauthorized) -> Response:
    """
    Error handler for HTTP status 401.
    """
    response_body = {
        "success": False,
        "message": error.description or "Unauthorized",
    }

    return jsonify(response_body), 401


@app.errorhandler(406)
def not_acceptable_handler(error: NotAcceptable) -> Response:
    """
    Error handler for HTTP status 406.
    """
    response_body = {
        "success": False,
        "message": error.description or "Not acceptable",
    }

    return jsonify(response_body), 406


@app.errorhandler(429)
def too_many_requests_handler(error: TooManyRequests) -> Response:
    """
    Error handler for HTTP status 429.
    """
    response_body = {
        "success": False,
        "message": error.description or "Too many requests",
    }

    return jsonify(response_body), 406


@app.errorhandler(500)
def internal_server_error_handler(error: InternalServerError) -> Response:
    """
    Error handler for HTTP status 500.
    """
    response_body = {
        "success": False,
        "message": error.description or "Internal server error",
    }

    return jsonify(response_body), 500


@app.errorhandler(504)
def gateway_timeout_handler(error: GatewayTimeout) -> Response:
    """
    Error handler for HTTP status 504.
    """
    response_body = {
        "success": False,
        "message": error.description or "Request timed out",
    }

    return jsonify(response_body), 504


@app.route("/", methods=["GET"])
def base_url() -> Response:
    """
    The base URL route for the Letterboxd Movie Recommendations API.
    """
    response_body = {
        "data": "This is the base URL for the Letterboxd Movie Recommendations API.",
        "success": True,
        "message": "Successfully loaded base URL for Letterboxd Movie Recommendations API.",
    }

    return jsonify(response_body), 200


@app.route("/api/users", methods=["GET"])
def users() -> Response:
    """
    Gets a list of users.
    """
    try:
        users = database.get_user_list()

        response_body = {
            "data": users,
            "success": True,
            "message": "Successfully retrieved user list",
        }

        return jsonify(response_body), 200
    except Exception as e:
        print(e, file=sys.stderr)
        abort(code=500, description="Failed to load user list")


@app.route("/api/get-recommendations", methods=["POST"])
@rate_limit(service="recommendations", rate_limits=[(10, 60), (50, 3600), (250, 86400)])
async def get_recommendations() -> Response:
    """
    Gets movie recommendations.
    """
    start = time.perf_counter()

    try:
        data = request.json.get("currentQuery")
        usernames = data.get("usernames")
        model_type = data.get("model_type")
        genres = data.get("genres")
        content_types = data.get("content_types")
        min_release_year = data.get("min_release_year")
        max_release_year = data.get("max_release_year")
        min_runtime = data.get("min_runtime")
        max_runtime = data.get("max_runtime")
        popularity = data.get("popularity")
        highly_rated = data.get("highly_rated")
        allow_rewatches = data.get("allow_rewatches")
    except Exception as e:
        print(e, file=sys.stderr)
        abort(code=400, description="Missing required request parameters")

    # Manual override
    if len(usernames) == 1:
        allow_rewatches = False

    # Gets movie recommedations
    try:
        if len(usernames) == 1:
            recommendations = await asyncio.wait_for(
                recommend_n_movies(
                    num_recs=96,
                    user=usernames[0],
                    model_type=model_type,
                    genres=genres,
                    content_types=content_types,
                    min_release_year=min_release_year,
                    max_release_year=max_release_year,
                    min_runtime=min_runtime,
                    max_runtime=max_runtime,
                    popularity=popularity,
                    highly_rated=highly_rated,
                    allow_rewatches=allow_rewatches,
                ),
                timeout=120,
            )
            recommendations = recommendations["recommendations"].to_dict(
                orient="records"
            )
        else:
            tasks = [
                recommend_n_movies(
                    num_recs=500,
                    user=username,
                    model_type=model_type,
                    genres=genres,
                    content_types=content_types,
                    min_release_year=min_release_year,
                    max_release_year=max_release_year,
                    min_runtime=min_runtime,
                    max_runtime=max_runtime,
                    popularity=popularity,
                    highly_rated=highly_rated,
                    allow_rewatches=allow_rewatches,
                )
                for username in usernames
            ]
            all_recommendations = await asyncio.wait_for(
                asyncio.gather(*tasks), timeout=120
            )

            # Merges recommendations
            merged_recommendations = merge_recommendations(
                num_recs=96, all_recommendations=all_recommendations
            )
            recommendations = merged_recommendations.to_dict(orient="records")
    except asyncio.TimeoutError:
        print("Recommendations timed out", file=sys.stderr)
        abort(code=504, description="Recommendations timed out")
    except RecommendationFilterException as e:
        print(e, file=sys.stderr)
        abort(
            code=406,
            description=e.message,
        )
    except UserProfileException as e:
        print(e, file=sys.stderr)
        abort(code=500, description=e.message)
    except Exception as e:
        print(e, file=sys.stderr)
        abort(code=500, description="Failed to generate movie recommendations")

    # Updates user logs in database
    if not current_app.config.get("DISABLE_DB_WRITES"):
        try:
            database.update_many_user_logs(usernames)
            print(f'Successfully logged {", ".join(map(str, usernames))} in database')
        except Exception as e:
            print(e, file=sys.stderr)
            print(
                f'Failed to log {", ".join(map(str, usernames))} in database',
                file=sys.stderr,
            )

    finish = time.perf_counter()
    print(
        f'Generated movie recommendations for {", ".join(map(str, usernames))} in {finish - start} seconds'
    )

    response_body = {
        "data": recommendations,
        "success": True,
        "message": "Successfully generated movie recommendations",
    }

    return jsonify(response_body), 200


@app.route("/api/get-natural-language-recommendations", methods=["POST"])
@rate_limit(
    service="recommendations_nlp", rate_limits=[(10, 60), (50, 3600), (250, 86400)]
)
async def get_natural_language_recommendations() -> Response:
    """
    Gets movie recommendations based on a natural language description.
    """
    start = time.perf_counter()

    try:
        data = request.json.get("currentFilterQuery")
        username = data.get("username")
        prompt = data.get("description")
    except Exception as e:
        print(e, file=sys.stderr)
        abort(code=400, description="Missing required request parameters")

    # Gets filters
    try:
        filters = await asyncio.wait_for(
            generate_recommendation_filters(prompt=prompt), timeout=120
        )
        model_type = filters.model_type
        genres = list(filters.genres)
        content_types = list(filters.content_types)
        min_release_year = filters.min_release_year
        max_release_year = filters.max_release_year
        min_runtime = filters.min_runtime
        max_runtime = filters.max_runtime
        popularity = list(filters.popularity)
        highly_rated = bool(filters.highly_rated)
        allow_rewatches = bool(filters.allow_rewatches)
    except asyncio.TimeoutError:
        print("Natural language filter generation timed out", file=sys.stderr)
        abort(code=504, description="Recommendations timed out")
    except DescriptionLengthException as e:
        print(e, file=sys.stderr)
        abort(code=406, description=e.message)
    except FilterParseException as e:
        print(e, file=sys.stderr)
        abort(code=500, description=e.message)
    except Exception as e:
        print(e, file=sys.stderr)
        abort(code=500, description="Failed to generate movie recommendations")

    finish = time.perf_counter()
    print(
        f"Parsed filters from description for {username} in {time.perf_counter() - start} seconds"
    )

    # Gets movie recommedations
    try:
        recommendations = await asyncio.wait_for(
            recommend_n_movies(
                num_recs=96,
                user=username,
                model_type=model_type,
                genres=genres,
                content_types=content_types,
                min_release_year=min_release_year,
                max_release_year=max_release_year,
                min_runtime=min_runtime,
                max_runtime=max_runtime,
                popularity=popularity,
                highly_rated=highly_rated,
                allow_rewatches=allow_rewatches,
            ),
            timeout=120,
        )
        recommendations = recommendations["recommendations"].to_dict(orient="records")
    except asyncio.TimeoutError:
        print("Natural language recommendations timed out", file=sys.stderr)
        abort(code=504, description="Recommendations timed out")
    except RecommendationFilterException as e:
        print(e, file=sys.stderr)
        abort(
            code=406,
            description=e.message,
        )
    except UserProfileException as e:
        print(e, file=sys.stderr)
        abort(code=500, description=e.message)
    except Exception as e:
        print(e, file=sys.stderr)
        abort(code=500, description="Failed to generate movie recommendations")

    # Updates user logs in database
    if not current_app.config.get("DISABLE_DB_WRITES"):
        try:
            database.update_user_log(user=username)
            print(f"Successfully logged {username} in database")
        except Exception as e:
            print(e, file=sys.stderr)
            print(
                f"Failed to log {username} in database",
                file=sys.stderr,
            )

    finish = time.perf_counter()
    print(f"Generated movie recommendations for {username} in {finish - start} seconds")

    response_body = {
        "data": recommendations,
        "success": True,
        "message": "Successfully generated movie recommendations",
    }

    return jsonify(response_body), 200


@app.route("/api/get-prediction-recommendations", methods=["POST"])
@rate_limit(
    service="recommendations_predictions",
    rate_limits=[(10, 60), (50, 3600), (250, 86400)],
)
async def get_prediction_recommendations() -> Response:
    """
    Gets predicted ratings for a set of movies.
    """
    start = time.perf_counter()

    try:
        data = request.json.get("currentPredictionQuery")
        username = data.get("username")
        prediction_list = data.get("prediction_list")
    except Exception as e:
        print(e, file=sys.stderr)
        abort(code=400, description="Missing required request parameters")

    # Gets movie recommedations
    try:

        predictions = await asyncio.wait_for(
            predict_movies(user=username, prediction_list=prediction_list),
            timeout=120,
        )
        predictions = predictions["predictions"].to_dict(orient="records")
    except asyncio.TimeoutError:
        print("Predictions timed out", file=sys.stderr)
        abort(code=504, description="Predictions timed out")
    except PredictionListException as e:
        print(e, file=sys.stderr)
        abort(
            code=500,
            description=e.message,
        )
    except UserProfileException as e:
        print(e, file=sys.stderr)
        abort(code=500, description=e.message)
    except Exception as e:
        print(e, file=sys.stderr)
        abort(code=500, description="Failed to generate movie predictions")

    # Updates user logs in database
    if not current_app.config.get("DISABLE_DB_WRITES"):
        try:
            database.update_user_log(user=username)
            print(f"Successfully logged {username} in database")
        except Exception as e:
            print(e, file=sys.stderr)
            print(
                f"Failed to log {username} in database",
                file=sys.stderr,
            )

    finish = time.perf_counter()
    print(f"Generated rating predictions for {username} in {finish - start} seconds")

    response_body = {
        "data": predictions,
        "success": True,
        "message": "Successfully generated rating predictions",
    }

    return jsonify(response_body), 200


@app.route("/api/get-statistics", methods=["POST"])
@rate_limit(service="statistics", rate_limits=[(10, 60), (50, 3600), (250, 86400)])
async def get_statistics() -> Response:
    """
    Gets user statistics.
    """
    start = time.perf_counter()

    try:
        username = request.json.get("username")
    except Exception as e:
        print(e, file=sys.stderr)
        abort(code=400, description="Missing required request parameters")

    # Gets movie data from database
    try:
        movie_data = database.get_movie_data()
    except Exception as e:
        print(e, file=sys.stderr)
        abort(code=500, description="Failed to load movie data")

    # Gets user dataframe
    try:
        user_df = await get_user_dataframe(username, movie_data, update_urls=True)
    except UserProfileException as e:
        print(e, file=sys.stderr)
        abort(code=500, description=e.message)
    except Exception as e:
        print(e, file=sys.stderr)
        abort(code=500, description="Failed to load user data")

    # Updates user log in database
    if not current_app.config.get("DISABLE_DB_WRITES"):
        try:
            database.update_user_log(username)
            print(f"Successfully logged {username} in database")
        except:
            print(f"Failed to log {username} in database", file=sys.stderr)

    # Gets user stats
    try:
        user_stats = await get_user_statistics(user_df)
        statistics = {"simple_stats": user_stats}
    except Exception as e:
        print(e, file=sys.stderr)
        abort(code=500, description="Failed to calculate user statistics")

    # Updates user stats in database
    if not current_app.config.get("DISABLE_DB_WRITES"):
        try:
            database.update_user_statistics(username, user_stats)
            print(f"Successfully updated statistics for {username} in database")
        except:
            print(
                f"Failed to update statistics for {username} in database",
                file=sys.stderr,
            )

    # Gets user distribution values
    statistics["distribution"] = {
        "user_rating_values": user_df["user_rating"].tolist(),
        "letterboxd_rating_values": user_df["letterboxd_rating"].dropna().tolist(),
    }

    # Gets user percentiles
    try:
        user_percentiles = get_user_percentiles(user_stats)
        statistics["percentiles"] = user_percentiles
    except Exception as e:
        print(e, file=sys.stderr)
        abort(code=500, description="Failed to calculate user statistics")

    finish = time.perf_counter()
    print(f"Calculated profile statistics for {username} in {finish - start} seconds")

    response_body = {
        "data": statistics,
        "success": True,
        "message": "Successfully calculated user profile statistics",
    }

    return jsonify(response_body), 200


@app.route("/api/get-watchlist-picks", methods=["POST"])
@rate_limit(service="watchlist", rate_limits=[(10, 60), (50, 3600), (250, 86400)])
async def get_watchlist_picks() -> Response:
    """
    Gets watchlist picks.
    """
    start = time.perf_counter()

    try:
        data = request.json.get("currentQuery")
        user_list = data.get("usernames")
        overlap = data.get("overlap")
        pick_type = data.get("pickType")
        model_type = "personalized"
        num_picks = 12
    except Exception as e:
        print(e, file=sys.stderr)
        abort(code=400, description="Missing required request parameters")

    # Gets watchlist picks
    try:
        watchlist_picks = await asyncio.wait_for(
            get_user_watchlist_picks(
                user_list=user_list,
                overlap=overlap,
                pick_type=pick_type,
                model_type=model_type,
                num_picks=num_picks,
            ),
            timeout=120,
        )
    except asyncio.TimeoutError:
        print("Watchlist picks timed out", file=sys.stderr)
        abort(code=504, description="Watchlist picks timed out")
    except UserProfileException as e:
        abort(code=406, description=e.message)
    except WatchlistOverlapException as e:
        abort(code=406, description=e.message)
    except WatchlistEmptyException as e:
        abort(code=500, description=e.message)
    except Exception:
        abort(code=500, description="Failed to get user watchlist picks")

    # Updates user logs in database
    if not current_app.config.get("DISABLE_DB_WRITES"):
        try:
            database.update_many_user_logs(user_list)
            print(f'Successfully logged {", ".join(map(str, user_list))} in database')
        except:
            print(
                f'Failed to log {", ".join(map(str, user_list))} in database',
                file=sys.stderr,
            )

    finish = time.perf_counter()
    print(
        f'Picked from watchlist for {", ".join(map(str, user_list))} in {finish - start} seconds'
    )

    response_body = {
        "data": watchlist_picks,
        "success": True,
        "message": "Successfully picked from user watchlist(s)",
    }

    return jsonify(response_body), 200


@app.route("/api/get-compatibility", methods=["POST"])
@rate_limit(service="compatibility", rate_limits=[(10, 60), (50, 3600), (250, 86400)])
async def get_compatibility() -> Response:
    """
    Gets the compatibility of two Letterboxd profiles.
    """
    start = time.perf_counter()

    try:
        data = request.json.get("currentQuery")
        username_1 = data.get("username_1")
        username_2 = data.get("username_2")
    except Exception as e:
        print(e, file=sys.stderr)
        abort(code=400, description="Missing required request parameters")

    # Gets compatibility
    try:
        compatibility = await asyncio.wait_for(
            determine_compatibility(username_1=username_1, username_2=username_2),
            timeout=120,
        )
    except asyncio.TimeoutError:
        print("Compatibility timed out", file=sys.stderr)
        abort(code=504, description="Compatibility timed out")
    except UserProfileException as e:
        abort(code=406, description=e.message)
    except Exception as e:
        print(e)
        abort(code=500, description="Failed to get compatibility")

    # Updates user logs in database
    if not current_app.config.get("DISABLE_DB_WRITES"):
        try:
            database.update_many_user_logs([username_1, username_2])
            print(f"Successfully logged {username_1}, {username_2} in database")
        except Exception as e:
            print(e, file=sys.stderr)
            print(
                f"Failed to log {username_1}, {username_2} in database",
                file=sys.stderr,
            )

    finish = time.perf_counter()
    print(
        f"Determined compatibility of {username_1} and {username_2} in {finish - start} seconds"
    )

    response_body = {
        "data": compatibility,
        "success": True,
        "message": "Successfully calculated compatibility",
    }

    return jsonify(response_body), 200


@app.route("/api/get-frequently-asked-questions", methods=["GET"])
async def get_frequently_asked_questions() -> Response:
    """
    Gets frequently asked questions.
    """
    try:
        with open("data/faq.json", "r") as f:
            faq = json.load(f)

        response_body = {
            "data": faq,
            "success": True,
            "message": "Successfully loaded frequently asked questions",
        }

        return jsonify(response_body), 200
    except Exception as e:
        print(e, file=sys.stderr)
        abort(code=500, description="Failed to load frequently asked questions")


@app.route("/api/get-application-metrics", methods=["GET"])
async def get_application_metrics() -> Response:
    """
    Gets application metrics.
    """
    try:
        metrics = database.get_application_metrics()

        response_body = {
            "data": metrics,
            "success": True,
            "message": "Successfully loaded application metrics",
        }

        return jsonify(response_body), 200
    except Exception as e:
        print(e, file=sys.stderr)
        abort(code=500, description="Failed to load application metrics")


@app.route("/api/get-release-notes", methods=["GET"])
async def get_release_notes() -> Response:
    """
    Gets release notes.
    """
    try:
        with open("data/release_notes.json", "r") as f:
            notes = json.load(f)

        response_body = {
            "data": notes,
            "success": True,
            "message": "Successfully loaded release notes",
        }

        return jsonify(response_body), 200
    except Exception as e:
        print(e, file=sys.stderr)
        abort(code=500, description="Failed to load release notes")


@app.route("/api/admin/clear-movie-data-cache", methods=["POST"])
def clear_movie_data_cache() -> Response:
    """
    Clears movie data cache.
    """
    auth = request.headers.get("Authorization")
    if auth != f'Bearer {os.getenv("ADMIN_SECRET_KEY")}':
        abort(code=401, description="Unauthorized")

    try:
        database.get_movie_data_cached.cache_clear()
    except Exception as e:
        print(e, file=sys.stderr)
        abort(code=500, description="Failed to clear movie data cache")

    response_body = {
        "success": True,
        "message": "Successfully cleared movie data cache",
    }

    return jsonify(response_body), 200


if __name__ == "__main__":

    app.run(debug=True, port=3000)
