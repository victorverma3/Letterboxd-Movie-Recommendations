import MovieCard from "../Cards/MovieCard";

import { RecommendationResponse } from "../../types/RecommendationsTypes";

interface PredictDisplayProps {
    predictions: RecommendationResponse[];
}

const PredictDisplay = ({ predictions }: PredictDisplayProps) => {
    return (
        <div className="w-fit max-w-4/5 lg:max-w-[700px] mt-4 mx-auto p-4 flex flex-wrap gap-2 justify-evenly rounded-lg bg-palette-lightbrown">
            {predictions.map((rec) => (
                <MovieCard key={rec.url} recommendation={rec} />
            ))}
        </div>
    );
};

export default PredictDisplay;
