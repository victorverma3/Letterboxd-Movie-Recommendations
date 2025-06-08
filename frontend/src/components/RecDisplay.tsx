import MovieCard from "./Cards/MovieCard";

import { RecommendationResponse } from "../types/RecommendationsTypes";

interface RecDisplayProps {
    recommendations: RecommendationResponse[];
}

const RecDisplay = ({ recommendations }: RecDisplayProps) => {
    return (
        <div className="max-h-128 overflow-y-scroll overflow-x-hidden w-fit max-w-5xl mt-4 mx-auto py-4 flex flex-wrap gap-4 justify-around bg-palette-lightbrown">
            {recommendations.map((rec) => (
                <MovieCard key={rec.url} recommendation={rec} />
            ))}
        </div>
    );
};

export default RecDisplay;
