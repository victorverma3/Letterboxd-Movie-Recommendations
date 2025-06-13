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
    genres: string[];
    content_types: string[];
    min_release_year: number;
    max_release_year: number;
    min_runtime: number;
    max_runtime: number;
    popularity: number;
};
