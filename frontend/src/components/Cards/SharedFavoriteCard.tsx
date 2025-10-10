import { Link } from "react-router-dom";

import { SharedFavoriteType } from "../../types/CompatibilityTypes";

interface SharedFavoriteCardProps {
    favorite: SharedFavoriteType;
}

const SharedFavoriteCard = ({ favorite }: SharedFavoriteCardProps) => {
    return (
        <div className="w-16 sm:w-24 flex flex-col border-2 border-gray-200 rounded-lg duration-200 bg-white hover:transition hover:border-palette-darkbrown hover:shadow-lg">
            <Link
                to={`https://letterboxd.com${favorite.url}`}
                target="_blank"
                className="h-full flex flex-col justify-between"
            >
                <img
                    className="w-full rounded-tr-md rounded-tl-md"
                    src={favorite.poster}
                    alt="error displaying poster"
                />
            </Link>
        </div>
    );
};

export default SharedFavoriteCard;
