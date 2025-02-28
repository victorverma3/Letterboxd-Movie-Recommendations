export type DistributionResponse = {
    user_rating_values: number[];
    letterboxd_rating_values: number[];
};

export type GenreAverage = {
    mean_rating_differential: number;
    mean_user_rating: number;
};

export type GenreStatsResponse = {
    action: GenreAverage;
    adventure: GenreAverage;
    animation: GenreAverage;
    comedy: GenreAverage;
    crime: GenreAverage;
    documentary: GenreAverage;
    drama: GenreAverage;
    family: GenreAverage;
    fantasy: GenreAverage;
    history: GenreAverage;
    horror: GenreAverage;
    music: GenreAverage;
    mystery: GenreAverage;
    romance: GenreAverage;
    science_fiction: GenreAverage;
    thriller: GenreAverage;
    tv_movie: GenreAverage;
    war: GenreAverage;
    western: GenreAverage;
};

export type PercentilesResponse = {
    user_rating_percentile: number;
    letterboxd_rating_percentile: number;
    rating_differential_percentile: number;
    letterboxd_rating_count_percentile: number;
};

export type SimpleStatsResponse = {
    genre_averages: GenreStatsResponse;
    letterboxd_rating: {
        mean: number;
        std: number;
    };
    letterboxd_rating_count: {
        mean: number;
    };
    rating_differential: {
        mean: number;
        std: number;
    };
    user_rating: {
        mean: number;
        std: number;
    };
};

export type StatisticsFormValues = {
    username: string;
};

export type StatisticsResponse = {
    simple_stats: SimpleStatsResponse;
    distribution: DistributionResponse;
    percentiles: PercentilesResponse;
};
