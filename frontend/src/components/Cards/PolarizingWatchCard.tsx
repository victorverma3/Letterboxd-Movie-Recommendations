import { Link } from "react-router-dom";

import { PolarizingWatch } from "../../types/CompatibilityTypes";

interface PolarizingWatchCardProps {
    watch: PolarizingWatch;
    username_1: string;
    username_2: string;
}

const PolarizingWatchCard = ({
    watch,
    username_1,
    username_2,
}: PolarizingWatchCardProps) => {
    return (
        <div className="w-24 sm:w-32 flex flex-col border-2 border-gray-200 rounded-lg duration-200 bg-white hover:transition hover:border-palette-darkbrown hover:shadow-lg">
            <Link
                to={`https://letterboxd.com${watch.url}`}
                target="_blank"
                className="h-full flex flex-col justify-between"
            >
                <img
                    className="w-full rounded-tr-md rounded-tl-md"
                    src={watch.poster}
                    alt="error displaying poster"
                />
            </Link>
            <div className="p-1">
                <p className="text-[8px] sm:text-xs">
                    {username_1}: {watch.user_rating_user_1}★
                </p>
                <p className="text-[8px] sm:text-xs">
                    {username_2}: {watch.user_rating_user_2}★
                </p>
            </div>
        </div>
    );
};

export default PolarizingWatchCard;
