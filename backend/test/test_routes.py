from flask.testing import FlaskClient
import json
import os
import pytest
import sys

project_root = os.path.dirname((os.path.join(os.path.dirname(__file__), "../..")))
sys.path.append(project_root)

from main import app


@pytest.fixture
def client():
    """
    Configures Flask env for testing.
    """
    app.config["TESTING"] = True
    app.config["DISABLE_DB_WRITES"] = True

    with app.test_client() as client:
        yield client


class TestRecommendations:
    """
    Tests the recommendation routes for the website.
    """

    def test_get_recommendations_single_user(self, client: FlaskClient) -> None:
        """
        Tests the recommendations route with a single user.
        """
        payload = {
            "currentQuery": {
                "usernames": ["victorverma"],
                "model_type": "personalized",
                "genres": [
                    "action",
                    "adventure",
                    "animation",
                    "comedy",
                    "crime",
                    "documentary",
                    "drama",
                    "family",
                    "fantasy",
                    "history",
                    "horror",
                    "mystery",
                    "romance",
                    "science_fiction",
                    "tv_movie",
                    "thriller",
                    "war",
                    "western",
                ],
                "content_types": ["movie"],
                "min_release_year": 1920,
                "max_release_year": 2025,
                "min_runtime": 0,
                "max_runtime": 1200,
                "popularity": ["low", "medium", "high"],
                "highly_rated": False,
                "allow_rewatches": False,
            }
        }

        response = client.post(
            "/api/get-recommendations",
            data=json.dumps(payload),
            content_type="application/json",
        )

        assert response.status_code == 200

    def test_get_recommendations_multiple_users(self, client: FlaskClient) -> None:
        """
        Tests the recommendations route with multiple users.
        """
        payload = {
            "currentQuery": {
                "usernames": ["victorverma", "jconn8"],
                "model_type": "personalized",
                "genres": [
                    "action",
                    "adventure",
                    "animation",
                    "comedy",
                    "crime",
                    "documentary",
                    "drama",
                    "family",
                    "fantasy",
                    "history",
                    "horror",
                    "mystery",
                    "romance",
                    "science_fiction",
                    "tv_movie",
                    "thriller",
                    "war",
                    "western",
                ],
                "content_types": ["movie"],
                "min_release_year": 1920,
                "max_release_year": 2025,
                "min_runtime": 0,
                "max_runtime": 1200,
                "popularity": ["low", "medium", "high"],
                "highly_rated": False,
                "allow_rewatches": False,
            }
        }

        response = client.post(
            "/api/get-recommendations",
            data=json.dumps(payload),
            content_type="application/json",
        )

        assert response.status_code == 200


class TestNaturalLanguageRecommendations:
    """
    Tests the natural language recommendation routes for the website.
    """

    def test_get_natural_language_recommendations_single_user(
        self, client: FlaskClient
    ) -> None:
        """
        Tests the natural language recommendations route with a single user.
        """
        payload = {
            "currentFilterQuery": {
                "username": "victorverma",
                "description": "I want to watch an 80s action-comedy movie.",
            }
        }

        response = client.post(
            "/api/get-natural-language-recommendations",
            data=json.dumps(payload),
            content_type="application/json",
        )

        assert response.status_code == 200

    def test_get_natural_language_recommendations_long_description(
        self, client: FlaskClient
    ) -> None:

        payload = {
            "currentFilterQuery": {
                "usernames": "victorverma",
                "description": "Lately, I've been noticing how my sentences have a tendency to keep going when I write them onscreen. This goes for concentrated writing as well as correspondence. (Twain probably believed that correspondence, in an ideal world, also demands concentration. But he never used email.) Last week I caught myself packing four conjunctions into a three-line sentence in an email. That's inexcusable. Since then, I have tried to eschew conjunctions whenever possible. Gone are the commas, the and's, but's, and so's; in are staccato declaratives. Better to read like bad Hemingway than bad Faulkner.",
            }
        }

        response = client.post(
            "/api/get-natural-language-recommendations",
            data=json.dumps(payload),
            content_type="application/json",
        )

        assert response.status_code == 406


class TestPredictions:
    """
    Tests the prediction routes for the website.
    """

    def test_get_prediction_recommendations_single_url(
        self, client: FlaskClient
    ) -> None:
        """
        Tests the predictions route with a single URL.
        """
        payload = {
            "currentPredictionQuery": {
                "username": "victorverma",
                "prediction_list": [
                    "https://letterboxd.com/film/a-nightmare-on-elm-street/"
                ],
            }
        }

        response = client.post(
            "/api/get-prediction-recommendations",
            data=json.dumps(payload),
            content_type="application/json",
        )

        assert response.status_code == 200

    def test_get_prediction_recommendations_multiple_urls(
        self, client: FlaskClient
    ) -> None:
        """
        Tests the predictions route with multiple URLs.
        """
        payload = {
            "currentPredictionQuery": {
                "username": "victorverma",
                "prediction_list": [
                    "https://letterboxd.com/film/a-nightmare-on-elm-street/",
                    "https://letterboxd.com/film/one-battle-after-another/",
                ],
            }
        }

        response = client.post(
            "/api/get-prediction-recommendations",
            data=json.dumps(payload),
            content_type="application/json",
        )

        assert response.status_code == 200

    def test_get_prediction_recommendations_invalid_url(
        self, client: FlaskClient
    ) -> None:
        """
        Tests the predictions route with an invalid URL.
        """
        payload = {
            "currentPredictionQuery": {
                "username": "victorverma",
                "prediction_list": [
                    "https://letterboxd.com/film/nightmare-on-elm-street/"
                ],
            }
        }

        response = client.post(
            "/api/get-prediction-recommendations",
            data=json.dumps(payload),
            content_type="application/json",
        )

        assert response.status_code == 500


class TestStatistics:
    """
    Tests the statistics routes for the website.
    """

    def test_get_statistics_single_user(self, client: FlaskClient) -> None:
        """
        Tests the statistics route with a single user.
        """
        payload = {"username": "victorverma"}

        response = client.post(
            "/api/get-statistics",
            data=json.dumps(payload),
            content_type="application/json",
        )

        assert response.status_code == 200


class TestWatchlist:
    """
    Tests the watchlist routes for the website.
    """

    def test_get_random_watchlist_picks_single_user(self, client: FlaskClient) -> None:
        """
        Tests the random watchlist picks route with a single user.
        """
        payload = {
            "currentQuery": {
                "usernames": ["victorverma"],
                "overlap": "y",
                "pick_type": "random",
            }
        }

        response = client.post(
            "/api/get-watchlist-picks",
            data=json.dumps(payload),
            content_type="application/json",
        )

        assert response.status_code == 200

    def test_get_random_watchlist_picks_multiple_users_overlap(
        self, client: FlaskClient
    ) -> None:
        """
        Tests the random watchlist picks route with multiple users and overlap.
        """
        payload = {
            "currentQuery": {
                "usernames": ["victorverma", "jconn8"],
                "overlap": "y",
                "pick_type": "random",
            }
        }

        response = client.post(
            "/api/get-watchlist-picks",
            data=json.dumps(payload),
            content_type="application/json",
        )

        assert response.status_code == 200

    def test_get_random_watchlist_picks_multiple_users_no_overlap(
        self, client: FlaskClient
    ) -> None:
        """
        Tests the random watchlist picks route with multiple users and no overlap.
        """
        payload = {
            "currentQuery": {
                "usernames": ["victorverma", "jconn8"],
                "overlap": "y",
                "pick_type": "random",
            }
        }

        response = client.post(
            "/api/get-watchlist-picks",
            data=json.dumps(payload),
            content_type="application/json",
        )

        assert response.status_code == 200

    def test_get_recommendation_watchlist_picks_single_user(
        self, client: FlaskClient
    ) -> None:
        """
        Tests the recommendation watchlist picks route with a single user.
        """
        payload = {
            "currentQuery": {
                "usernames": ["victorverma"],
                "overlap": "y",
                "pick_type": "recommendation",
            }
        }

        response = client.post(
            "/api/get-watchlist-picks",
            data=json.dumps(payload),
            content_type="application/json",
        )

        assert response.status_code == 200

    def test_get_recommendation_watchlist_picks_multiple_users_overlap(
        self, client: FlaskClient
    ) -> None:
        """
        Tests the recommendation watchlist picks route with multiple users and overlap.
        """
        payload = {
            "currentQuery": {
                "usernames": ["victorverma", "jconn8"],
                "overlap": "y",
                "pick_type": "recommendation",
            }
        }

        response = client.post(
            "/api/get-watchlist-picks",
            data=json.dumps(payload),
            content_type="application/json",
        )

        assert response.status_code == 200

    def test_get_recommendation_watchlist_picks_multiple_users_no_overlap(
        self, client: FlaskClient
    ) -> None:
        """
        Tests the recommendation watchlist picks route with multiple users and no overlap.
        """
        payload = {
            "currentQuery": {
                "usernames": ["victorverma", "jconn8"],
                "overlap": "y",
                "pick_type": "recommendation",
            }
        }

        response = client.post(
            "/api/get-watchlist-picks",
            data=json.dumps(payload),
            content_type="application/json",
        )

        assert response.status_code == 200


class TestCompatibility:
    """
    Tests the compatibility routes for the website.
    """

    def test_get_compatibility(self, client: FlaskClient) -> None:
        """
        Tests the compatibility route.
        """
        payload = {
            "currentQuery": {
                "username_1": "victorverma",
                "username_2": "jconn8",
            }
        }

        response = client.post(
            "/api/get-compatibility",
            data=json.dumps(payload),
            content_type="application/json",
        )

        assert response.status_code == 200


class TestOther:
    """
    Tests the other routes for the website.
    """

    def test_get_frequently_asked_questions(self, client: FlaskClient) -> None:
        """
        Tests the frequently asked questions route.
        """

        response = client.get(
            "/api/get-frequently-asked-questions",
            content_type="application/json",
        )

        assert response.status_code == 200

    def test_get_application_metrics(self, client: FlaskClient) -> None:
        """
        Tests the application metrics route.
        """

        response = client.get(
            "/api/get-application-metrics",
            content_type="application/json",
        )

        assert response.status_code == 200

    def test_get_release_notes(self, client: FlaskClient) -> None:
        """
        Tests the get release notes route.
        """

        response = client.get(
            "/api/get-release-notes",
            content_type="application/json",
        )

        assert response.status_code == 200
