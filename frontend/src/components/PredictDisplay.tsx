import MovieCard from "./Cards/MovieCard";

import { RecommendationResponse } from "../types/RecommendationsTypes";

interface PredictDisplayProps {
    predictions: RecommendationResponse[];
}

const PredictDisplay = ({ predictions }: PredictDisplayProps) => {
    return (
        <div className="w-fit max-w-5xl mt-4 mx-auto py-4 px-2 flex flex-wrap gap-4 justify-around bg-palette-lightbrown">
            {predictions.map((rec) => (
                <MovieCard key={rec.url} recommendation={rec} />
            ))}
        </div>
    );
};

export default PredictDisplay;
