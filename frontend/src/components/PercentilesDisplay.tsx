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
    const getTitleText = (percentile: number) => {
        if (percentile > 80) {
            return "You tend to love every movie significantly more than the average user";
        } else if (percentile > 60) {
            return "You tend to like most movies more than the average user";
        } else if (percentile > 40) {
            return "You tend to like movies as much as the average user";
        } else if (percentile > 20) {
            return "You tend to like most movies less than the average user";
        } else {
            return "You tend to hate every movie significantly more than the average user";
        }
    };
    const getRatingText = (percentile: number) => {
        if (percentile > 80) {
            return "Glazer";
        } else if (percentile > 60) {
            return "Fan";
        } else if (percentile > 40) {
            return "Fair";
        } else if (percentile > 20) {
            return "Critic";
        } else {
            return "Hater";
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
                <h2 className="w-fit mx-auto text-xl">
                    Movie Consumption Style
                </h2>
                <p
                    className="w-fit mx-auto mt-4 text-3xl text-amber-800"
                    title={getTitleText(
                        percentiles["rating_differential_percentile"]
                    )}
                >
                    {getRatingText(
                        percentiles["rating_differential_percentile"]
                    )}{" "}
                </p>
            </div>
        </div>
    );
};

export default PercentilesDisplay;
