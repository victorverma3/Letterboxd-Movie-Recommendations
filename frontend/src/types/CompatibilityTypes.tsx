export type CompatibilityFormValues = {
    username1: string;
    username2: string;
};

export type CompatibilityResponse = {
    username_1: string;
    username_2: string;
    film_compatibility_score: number;
    genre_preferences: Record<string, Record<string, number>>;
    genre_compatibility_score: number;
    era_preferences: Record<string, Record<number, number>>;
    era_compatibility_score: number;
    shared_favorites: SharedFavorite[] | null;
    polarizing_watches: PolarizingWatch[] | null;
};

export type CompatibilityQuery = {
    username_1: string;
    username_2: string;
};

export type PolarizingWatch = {
    poster: string;
    url: string;
    user_rating_user_1: string;
    user_rating_user_2: string;
};

export type SharedFavorite = {
    poster: string;
    url: string;
};
