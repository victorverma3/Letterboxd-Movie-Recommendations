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
    start_release_year: number;
    end_release_year: number;
    genres: string[];
    runtime: number;
};
