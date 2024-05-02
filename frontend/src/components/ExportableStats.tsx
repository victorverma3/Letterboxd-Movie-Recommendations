import StatsTable from "./StatsTable";

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

type PercentilesResponse = {
    user_rating_percentile: number;
    letterboxd_rating_percentile: number;
    rating_differential_percentile: number;
    letterboxd_rating_count_percentile: number;
};

interface ExportableStatsProps {
    statistics: StatisticsResponse;
    distribution: string;
    percentiles: PercentilesResponse;
}

const ExportableStats = ({
    statistics,
    distribution,
    percentiles,
}: ExportableStatsProps) => {
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
    return (
        <div className="w-[500px] max-w-fit mx-auto">
            <div className="mx-auto mt-4">
                <StatsTable statistics={statistics} />
            </div>
            <div className="mx-auto mt-8 flex flex-row justify-around">
                <div>
                    <h2 className="w-fit mx-auto text-xl">
                        Movie Rating Style
                    </h2>
                    <p className="w-fit mx-auto mt-4 text-3xl text-amber-800">
                        {getStyleRatingText(
                            percentiles["rating_differential_percentile"]
                        )}{" "}
                    </p>
                </div>
                <div>
                    <h2 className="w-fit mx-auto text-xl">Obscurity Rating</h2>
                    <p className="w-fit mx-auto mt-4 text-3xl text-amber-800">
                        {getObscurityRatingText(
                            percentiles["letterboxd_rating_count_percentile"]
                        )}{" "}
                    </p>
                </div>
            </div>
            <img
                className="block mx-auto w-[450px]"
                src={distribution}
                alt="rating-distribution"
            ></img>
        </div>
    );
};

export default ExportableStats;
