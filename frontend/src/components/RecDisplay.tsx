import MovieCard from "./Cards/MovieCard";

import { RecommendationResponse } from "../types/RecommendationsTypes";

interface RecDisplayProps {
    recommendations: RecommendationResponse[];
}

const RecDisplay = ({ recommendations }: RecDisplayProps) => {
    return (
        <div className="w-fit max-w-5xl mt-8 mx-auto flex flex-wrap justify-around">
            {recommendations.map((rec) => (
                <MovieCard key={rec.url} recommendation={rec} />
            ))}
        </div>
    );
};

export default RecDisplay;
