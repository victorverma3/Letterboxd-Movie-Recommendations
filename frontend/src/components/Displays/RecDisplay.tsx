import MovieCard from "../Cards/MovieCard";

import {
    PickRandomResponse,
    PickRecommendationResponse,
} from "../../types/WatchlistTypes";
import { RecommendationResponse } from "../../types/RecommendationsTypes";

interface RecDisplayProps {
    recommendations:
        | RecommendationResponse[]
        | PickRandomResponse[]
        | PickRecommendationResponse[];
}

const RecDisplay = ({ recommendations }: RecDisplayProps) => {
    return (
        <div className="max-h-128 overflow-y-scroll overflow-x-hidden w-fit max-w-4/5 md:max-w-[700px] sm:w-full mt-4 xl:mt-0 mx-auto py-4 px-2 flex flex-row flex-wrap gap-2 justify-evenly border-2 rounded-lg xl:rounded-t-none border-gray-200 bg-palette-lightbrown">
            {recommendations.map((rec) => (
                <MovieCard key={rec.url} recommendation={rec} />
            ))}
        </div>
    );
};

export default RecDisplay;
