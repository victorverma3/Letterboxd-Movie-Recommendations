export type RecommendationFormValues = {
    userList: string;
};

export type RecommendationResponse = {
    title: string;
    poster: string;
    release_year: number;
    predicted_rating: number;
    url: string;
};

export type RecommendationQuery = {
    usernames: string[];
    popularity: number;
    min_release_year: number;
    max_release_year: number;
    genres: string[];
    min_runtime: number;
    max_runtime: number;
};
