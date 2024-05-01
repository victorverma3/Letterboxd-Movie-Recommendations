type PercentilesResponse = {
    user_rating_percentile: number;
    letterboxd_rating_percentile: number;
    rating_differential_percentile: number;
    letterboxd_rating_count_percentile: number;
};

type StatisticsResponse = {
    user_rating: {
        mean: number;
        std: number;
    };
    letterboxd_rating: {
        mean: number;
        std: number;
    };
    rating_differential: {
        mean: number;
    };
    letterboxd_rating_count: {
        mean: number;
    };
};

interface PercentileDisplayProps {
    percentiles: PercentilesResponse;
    statistics: StatisticsResponse;
}

const PercentilesDisplay = ({
    percentiles,
    statistics,
}: PercentileDisplayProps) => {
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
        <div className="w-4/5 sm:w-5/8 min-w-24 sm:min-w-96 mx-auto mt-8">
            <div>
                <p className="mt-4 text-center text-xs sm:text-sm">
                    Your average user rating of{" "}
                    <span className="text-amber-800">
                        {statistics["user_rating"]["mean"]}
                    </span>{" "}
                    is higher than{" "}
                    <span className="text-amber-800">
                        {percentiles["user_rating_percentile"]}%
                    </span>{" "}
                    of users
                </p>
                <p className="mt-4 text-center text-xs sm:text-sm">
                    Your average Letterboxd rating of{" "}
                    <span className="text-amber-800">
                        {statistics["letterboxd_rating"]["mean"]}
                    </span>{" "}
                    is higher than{" "}
                    <span className="text-amber-800">
                        {percentiles["letterboxd_rating_percentile"]}%
                    </span>{" "}
                    of users
                </p>
                <p className="mt-4 text-center text-xs sm:text-sm">
                    Your average rating differential of{" "}
                    <span className="text-amber-800">
                        {statistics["rating_differential"]["mean"]}
                    </span>{" "}
                    is higher than{" "}
                    <span className="text-amber-800">
                        {percentiles["rating_differential_percentile"]}%
                    </span>{" "}
                    of users
                </p>
                <p className="mt-4 text-center text-xs sm:text-sm">
                    Your average rating count of{" "}
                    <span className="text-amber-800">
                        {statistics["letterboxd_rating_count"]["mean"]}
                    </span>{" "}
                    is higher than{" "}
                    <span className="text-amber-800">
                        {percentiles["letterboxd_rating_count_percentile"]}%
                    </span>{" "}
                    of users
                </p>
            </div>
            <div className="w-4/5 sm:w-3/5 min-w-24 sm:min-w-96 mx-auto mt-8">
                <h2 className="w-fit mx-auto text-l sm:text-xl">
                    Movie Consumption Style
                </h2>

                <p className="w-fit mx-auto mt-4 text-2xl sm:text-3xl text-amber-800">
                    {getRatingText(
                        percentiles["rating_differential_percentile"]
                    )}
                </p>
            </div>
        </div>
    );
};

export default PercentilesDisplay;
