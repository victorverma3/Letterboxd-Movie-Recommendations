type PercentilesResponse = {
    user_rating_percentile: number;
    letterboxd_rating_percentile: number;
    rating_differential_percentile: number;
    letterboxd_rating_count_percentile: number;
};

interface PercentileDisplayProps {
    percentiles: PercentilesResponse;
}

const PercentilesDisplay = ({ percentiles }: PercentileDisplayProps) => {
    const getStyleRatingText = (percentile: number) => {
        if (percentile > 80) {
            return "Fanatic";
        } else if (percentile > 60) {
            return "Enthusiast";
        } else if (percentile > 40) {
            return "Fair";
        } else if (percentile > 20) {
            return "Critic";
        } else {
            return "Hater";
        }
    };
    const getStyleDefinitionText = (percentile: number) => {
        if (percentile > 80) {
            return "You tend to love movies significantly more than the average user";
        } else if (percentile > 60) {
            return "You tend to like most movies more than the average user";
        } else if (percentile > 40) {
            return "You tend to rate movies the same as the average user";
        } else if (percentile > 20) {
            return "You tend to like most movies less than the average user";
        } else {
            return "You tend to like movies significantly less than the average user";
        }
    };
    const getObscurityRatingText = (percentile: number) => {
        if (percentile > 80) {
            return "Mainstream";
        } else if (percentile > 60) {
            return "Popular";
        } else if (percentile > 40) {
            return "Average";
        } else if (percentile > 25) {
            return "Niche";
        } else if (percentile > 10) {
            return "Cult";
        } else {
            return "Obscure";
        }
    };
    const getObscurityDefinitionText = (percentile: number) => {
        if (percentile > 80) {
            return "You tend to watch movies that most people have likely seen ";
        } else if (percentile > 60) {
            return "You tend to watch movies that are popular amongst users";
        } else if (percentile > 40) {
            return "You tend to watch movies with average popularity";
        } else if (percentile > 25) {
            return "You tend to watch movies many people may not have seen";
        } else if (percentile > 10) {
            return "You tend to watch very uncommon movies";
        } else {
            return "You tend to watch a lot of movies that are unheard of";
        }
    };
    return (
        <div className="w-4/5 sm:w-5/8 min-w-24 sm:min-w-96 mx-auto mt-8 text-center text-md sm:text-l">
            <div>
                <p className="mt-4">
                    Your average user rating is higher than{" "}
                    <span className="text-amber-800">
                        {percentiles["user_rating_percentile"]}%
                    </span>{" "}
                    of users
                </p>
                <p className="mt-4">
                    Your average Letterboxd rating is higher than{" "}
                    <span className="text-amber-800">
                        {percentiles["letterboxd_rating_percentile"]}%
                    </span>{" "}
                    of users
                </p>
                <p className="mt-4">
                    Your average rating differential is higher than{" "}
                    <span className="text-amber-800">
                        {percentiles["rating_differential_percentile"]}%
                    </span>{" "}
                    of users
                </p>
                <p className="mt-4">
                    Your average rating count is higher than{" "}
                    <span className="text-amber-800">
                        {percentiles["letterboxd_rating_count_percentile"]}%
                    </span>{" "}
                    of users
                </p>
            </div>
            <div className="w-4/5 sm:w-3/5 min-w-24 sm:min-w-96 mx-auto mt-8">
                <h2 className="w-fit mx-auto text-xl">Movie Rating Style</h2>
                <p className="w-fit mx-auto mt-4 text-3xl text-amber-800">
                    {getStyleRatingText(
                        percentiles["rating_differential_percentile"]
                    )}{" "}
                </p>
                <p className="w-fit mx-auto mt-4">
                    {getStyleDefinitionText(
                        percentiles["rating_differential_percentile"]
                    )}{" "}
                </p>
            </div>
            <div className="w-4/5 sm:w-3/5 min-w-24 sm:min-w-96 mx-auto mt-8">
                <h2 className="w-fit mx-auto text-xl">Obscurity Rating</h2>
                <p className="w-fit mx-auto mt-4 text-3xl text-amber-800">
                    {getObscurityRatingText(
                        percentiles["letterboxd_rating_count_percentile"]
                    )}{" "}
                </p>
                <p className="w-fit mx-auto mt-4">
                    {getObscurityDefinitionText(
                        percentiles["letterboxd_rating_count_percentile"]
                    )}{" "}
                </p>
            </div>
        </div>
    );
};

export default PercentilesDisplay;
