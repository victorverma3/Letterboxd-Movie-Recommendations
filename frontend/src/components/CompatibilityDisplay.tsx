import GenresRadarChart from "../components/Charts/GenresRadarChart";
import HorizontalDivider from "./Layout/HorizontalDivider";
import PolarizingWatchCard from "./Cards/PolarizingWatchCard";
import SharedFavoriteCard from "./Cards/SharedFavoriteCard";

import { CompatibilityResponse } from "../types/CompatibilityTypes";

interface CompatibilityDisplayProps {
    compatibility: CompatibilityResponse;
}
const CompatibilityDisplay = ({ compatibility }: CompatibilityDisplayProps) => {
    return (
        <div className="w-80 sm:w-128 mx-auto mt-8 flex flex-col space-y-4">
            {/* Film compatibility score */}
            <h2 className="w-fit mx-auto text-xl sm:text-2xl">
                Film Compatibility Score
            </h2>
            <p className="w-fit mx-auto text-3xl sm:text-4xl text-palette-darkbrown">
                {compatibility.film_compatibility_score}
            </p>
            <p className="text-justify sm:text-left">
                Based on their Letterboxd profiles,{" "}
                <span className="text-palette-darkbrown">
                    {compatibility.username_1}
                </span>{" "}
                and{" "}
                <span className="text-palette-darkbrown">
                    {compatibility.username_2}
                </span>{" "}
                have a film compatibility score of{" "}
                {compatibility.film_compatibility_score}. The score ranges from
                0 to 100, and a higher score indicates greater compatibility.
            </p>
            <p className="text-justify sm:text-left">
                This metric is calculated by looking at the similarity between
                rating patterns. If two users similarly rate movies with
                comparable characteristics, their film compatibility score will
                be higher.
            </p>
            <HorizontalDivider color="darkbrown" />

            {/* Genre Compatibility Score */}
            <h2 className="w-fit mx-auto text-xl sm:text-2xl">
                Genre Compatibility Score
            </h2>
            <p className="w-fit mx-auto text-3xl sm:text-4xl text-palette-darkbrown">
                {compatibility.genre_compatibility_score}
            </p>
            <GenresRadarChart data={compatibility.genre_preferences} />
            <p className="text-justify sm:text-left">
                Based on their genre preferences,{" "}
                <span className="text-palette-darkbrown">
                    {compatibility.username_1}
                </span>{" "}
                and{" "}
                <span className="text-palette-darkbrown">
                    {compatibility.username_2}
                </span>{" "}
                have a genre compatibility score of{" "}
                {compatibility.genre_compatibility_score}. The score ranges from
                0 to 100, and a higher score indicates greater compatibility.
            </p>
            <p className="text-justify sm:text-left">
                The genre preferences chart overlays the average rating given to
                each genre by both users. This metric is calculated by measuring
                the overlapping area of the polygons created by the genre
                distribution. If there is more overlap between users, the genre
                compatibility score will be higher.
            </p>
            <HorizontalDivider color="darkbrown" />

            {/* Shared Favorites */}
            <h2 className="w-fit mx-auto text-xl sm:text-2xl">
                Shared Favorites
            </h2>
            {compatibility.shared_favorites ? (
                <div className="flex flex-col gap-4">
                    <p className="text-justify sm:text-left">
                        There are {compatibility.shared_favorites.length} movies
                        that{" "}
                        <span className="text-palette-darkbrown">
                            {compatibility.username_1}
                        </span>{" "}
                        and{" "}
                        <span className="text-palette-darkbrown">
                            {compatibility.username_2}
                        </span>{" "}
                        have both rated 4.5★ or higher on Letterboxd.
                    </p>
                    <div className="w-fit mx-auto grid grid-cols-4 sm:grid-cols-5 gap-2">
                        {compatibility.shared_favorites.map((favorite) => (
                            <SharedFavoriteCard
                                key={favorite.url}
                                favorite={favorite}
                            />
                        ))}
                    </div>
                </div>
            ) : (
                <p className="text-justify sm:text-left">
                    There are no movies that{" "}
                    <span className="text-palette-darkbrown">
                        {compatibility.username_1}
                    </span>{" "}
                    and{" "}
                    <span className="text-palette-darkbrown">
                        {compatibility.username_2}
                    </span>{" "}
                    have both rated 4.5★ or higher on Letterboxd.
                </p>
            )}
            <HorizontalDivider color="darkbrown" />

            {/* Polarizing Watches */}
            <h2 className="w-fit mx-auto text-xl sm:text-2xl">
                Polarizing Watches
            </h2>
            {compatibility.polarizing_watches ? (
                <div className="flex flex-col gap-4">
                    <p className="text-justify sm:text-left">
                        These movies were rated the most differently by{" "}
                        <span className="text-palette-darkbrown">
                            {compatibility.username_1}
                        </span>{" "}
                        and{" "}
                        <span className="text-palette-darkbrown">
                            {compatibility.username_2}
                        </span>
                        .
                    </p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {compatibility.polarizing_watches.map((watch) => (
                            <PolarizingWatchCard
                                key={watch.url}
                                watch={watch}
                                username_1={compatibility.username_1}
                                username_2={compatibility.username_2}
                            />
                        ))}
                    </div>
                </div>
            ) : (
                <p className="text-justify sm:text-left">
                    There are no movies such that the ratings given by{" "}
                    <span className="text-palette-darkbrown">
                        {compatibility.username_1}
                    </span>{" "}
                    and{" "}
                    <span className="text-palette-darkbrown">
                        {compatibility.username_2}
                    </span>{" "}
                    differed by 2 stars or more.
                </p>
            )}
            <HorizontalDivider color="darkbrown" />

            <p className="text-justify sm:text-left">
                The FAQ explains the calculation of each metric in greater
                technical detail.
            </p>
        </div>
    );
};

export default CompatibilityDisplay;
