import { Link } from "react-router-dom";

type PickResponse = {
    title: string;
    poster: string;
    url: string;
    release_year: number;
};

interface WatchlistCardProps {
    pick: PickResponse;
}

const WatchlistCard = ({ pick }: WatchlistCardProps) => {
    return (
        <div className="w-36 sm:w-48 mt-4 flex flex-col border-2 border-gray-200 rounded-lg duration-200 hover:scale-105 hover:transition hover:border-palette-darkbrown hover:shadow-lg">
            <Link
                to={pick.url}
                target="_blank"
                className="h-full flex flex-col justify-between"
            >
                <img
                    className="w-full rounded-tr-md rounded-tl-md"
                    src={pick.poster}
                    alt="error displaying poster"
                />
                <div className="p-2 flex flex-col flex-1 justify-between">
                    <h2 className="text-sm sm:text-md text-left">
                        <span className="text-palette-brown font-semibold">
                            {pick.title}{" "}
                        </span>
                        ({pick.release_year})
                    </h2>
                </div>
            </Link>
        </div>
    );
};

export default WatchlistCard;