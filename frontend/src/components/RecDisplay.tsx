import MovieCard from "./MovieCard";

type RecommendationResponse = {
    title: string;
    poster: string;
    release_year: number;
    predicted_rating: number;
    url: string;
};

interface RecDisplayProps {
    recommendations: RecommendationResponse[];
}

const RecDisplay = ({ recommendations }: RecDisplayProps) => {
    return (
        <div className="w-fit max-w-5xl flex flex-wrap justify-around">
            {recommendations.map((rec) => (
                <MovieCard
                    title={rec.title}
                    poster={rec.poster}
                    release_year={rec.release_year}
                    predicted_rating={rec.predicted_rating}
                    url={rec.url}
                />
            ))}
        </div>
    );
};

export default RecDisplay;
