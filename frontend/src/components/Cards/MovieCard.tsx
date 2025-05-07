import { Link } from "react-router-dom";

import { RecommendationResponse } from "../../types/RecommendationsTypes";

interface MovieCardProps {
    recommendation: RecommendationResponse;
}

const MovieCard = ({ recommendation }: MovieCardProps) => {
    return (
        <div className="w-36 sm:w-48 flex flex-col border-2 border-gray-200 rounded-lg duration-200 hover:scale-105 hover:transition hover:border-palette-darkbrown hover:shadow-lg">
            <Link
                to={recommendation.url}
                target="_blank"
                className="h-full flex flex-col justify-between"
            >
                <img
                    className="w-full rounded-tr-md rounded-tl-md"
                    src={recommendation.poster}
                    alt="error displaying poster"
                />
                <div className="p-2 flex flex-col flex-1 justify-between">
                    <h2 className="text-sm sm:text-md text-left">
                        <span className="text-palette-brown font-semibold">
                            {recommendation.title}{" "}
                        </span>
                        ({recommendation.release_year})
                    </h2>
                    <h3 className="text-xs sm:text-sm text-left text-black">
                        Predicted Rating:{" "}
                        <span className="font-bold">
                            {recommendation.predicted_rating}
                        </span>
                    </h3>
                </div>
            </Link>
        </div>
    );
};

export default MovieCard;
