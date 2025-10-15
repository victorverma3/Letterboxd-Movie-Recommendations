import { Link } from "react-router-dom";

import { RecommendationResponse } from "../../types/RecommendationsTypes";

interface CarouselMovieCardProps {
    recommendation: RecommendationResponse;
}

const CarouselMovieCard = ({ recommendation }: CarouselMovieCardProps) => {
    return (
        <div className="h-fit w-28 lg:w-36 flex flex-col border-2 border-gray-200 rounded-lg duration-200 bg-white hover:scale-105 hover:transition hover:border-palette-darkbrown hover:shadow-lg">
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
                <div className="p-1 flex flex-col flex-1 justify-between">
                    <h3 className="text-sm text-left text-black">
                        Prediction:{" "}
                        <span className="font-bold">
                            {recommendation.predicted_rating}★
                        </span>
                    </h3>
                </div>
            </Link>
        </div>
    );
};

export default CarouselMovieCard;
