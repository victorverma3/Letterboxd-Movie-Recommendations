import { Link } from "react-router-dom";

interface MovieCardProps {
    title: string;
    poster: string;
    release_year: number;
    predicted_rating: number;
    url: string;
}

const MovieCard = ({
    title,
    poster,
    release_year,
    predicted_rating,
    url,
}: MovieCardProps) => {
    return (
        <div className="w-32 sm:w-48 mt-4 flex flex-col border-2 border-gray-200 rounded-lg duration-200 hover:scale-105 hover:transition hover:border-amber-800 hover:shadow-lg">
            <Link
                to={url}
                target="_blank"
                className="h-full flex flex-col justify-between"
            >
                <img
                    className="w-full rounded-md"
                    src={poster}
                    alt="error displaying poster"
                />
                <div className="p-2 flex flex-col flex-1 justify-between">
                    <h2 className="text-sm sm:text-md text-left">
                        <span className="text-amber-800 font-semibold">
                            {title}{" "}
                        </span>
                        ({release_year})
                    </h2>
                    <h3 className="text-xs sm:text-sm text-left text-black">
                        Predicted Rating:{" "}
                        <span className="font-bold">{predicted_rating}</span>
                    </h3>
                </div>
            </Link>
        </div>
    );
};

export default MovieCard;
