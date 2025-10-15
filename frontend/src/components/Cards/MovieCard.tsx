import { Link } from "react-router-dom";

import {
    PickRandomResponse,
    PickRecommendationResponse,
} from "../../types/WatchlistTypes";
import { RecommendationResponse } from "../../types/RecommendationsTypes";

interface MovieCardProps {
    recommendation:
        | RecommendationResponse
        | PickRandomResponse
        | PickRecommendationResponse;
}

const MovieCard = ({ recommendation }: MovieCardProps) => {
    return (
        <div className="w-24 sm:w-32 flex flex-col border-2 border-gray-200 rounded-lg duration-200 bg-white hover:scale-105 hover:transition hover:border-palette-darkbrown hover:shadow-lg">
            <Link
                to={`https://letterboxd.com${recommendation.url}`}
                target="_blank"
                className="h-full flex flex-col justify-between"
            >
                <img
                    className="w-full rounded-tr-md rounded-tl-md"
                    src={recommendation.poster}
                    alt="error displaying poster"
                />
                {"predicted_rating" in recommendation && (
                    <div className="p-1 flex flex-col flex-1 justify-between">
                        <h3 className="text-[10px] sm:text-xs text-left text-black">
                            Prediction:{" "}
                            <span className="font-bold">
                                {recommendation.predicted_rating}★
                            </span>
                        </h3>
                    </div>
                )}
            </Link>
        </div>
    );
};

export default MovieCard;
