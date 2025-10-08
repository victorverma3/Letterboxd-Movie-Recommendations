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
};

export type CompatibilityQuery = {
    username_1: string;
    username_2: string;
};
