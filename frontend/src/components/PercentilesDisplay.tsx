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
    const percentileItems = [
        {
            statistic: "average user rating",
            value: percentiles["user_rating_percentile"],
        },
        {
            statistic: "average Letterboxd rating",
            value: percentiles["letterboxd_rating_percentile"],
        },
        {
            statistic: "average rating differential",
            value: percentiles["rating_differential_percentile"],
        },
        {
            statistic: "average rating count",
            value: percentiles["letterboxd_rating_count_percentile"],
        },
    ];

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

    const superlativeItems = [
        {
            superlative: "Movie Rating Style",
            value: getStyleRatingText(
                percentiles["rating_differential_percentile"]
            ),
            definition: getStyleDefinitionText(
                percentiles["rating_differential_percentile"]
            ),
        },
        {
            superlative: "Obscurity Rating",
            value: getObscurityRatingText(
                percentiles["letterboxd_rating_count_percentile"]
            ),
            definition: getObscurityDefinitionText(
                percentiles["letterboxd_rating_count_percentile"]
            ),
        },
    ];
    return (
        <div className="max-w-4/5 mx-auto my-8 flex flex-col space-y-8 text-center">
            <div className="mx-auto flex flex-wrap justify-around gap-2 md:gap-4 text-md">
                {percentileItems.map((item, index) => (
                    <p
                        key={index}
                        className="w-40 p-2 rounded-xl bg-palette-lightbrown"
                    >
                        Your {item.statistic} is higher than{" "}
                        <span className="font-semibold ">{item.value}%</span> of
                        users
                    </p>
                ))}
            </div>

            <div className="mx-auto flex flex-wrap justify-around gap-4">
                {superlativeItems.map((item, index) => (
                    <div key={index} className="w-80">
                        <h2 className="w-fit mx-auto text-xl">
                            {item.superlative}
                        </h2>
                        <p className="w-fit mx-auto mt-4 text-3xl text-palette-darkbrown">
                            {item.value}
                        </p>
                        <p className="w-fit mx-auto mt-4">{item.definition}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PercentilesDisplay;
