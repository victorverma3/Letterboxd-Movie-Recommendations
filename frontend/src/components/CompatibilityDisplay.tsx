import GenresRadarChart from "../components/Charts/GenresRadarChart";

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

            <p className="text-justify sm:text-left">
                The FAQ explains the calculation of each metric in greater
                technical detail.
            </p>

            <p className="text-justify sm:text-left text-palette-darkbrown">
                More coming soon!
            </p>
        </div>
    );
};

export default CompatibilityDisplay;
