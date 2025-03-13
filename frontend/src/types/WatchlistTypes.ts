export type PickFormValues = {
    userList: string;
    overlap: string;
    numPicks: number;
};

export type PickResponseBrief = {
    title: string;
    url: string;
};

export type PickType = "random" | "recommendation";

export type RandomPickResponse = {
    title: string;
    poster: string;
    url: string;
    release_year: number;
};

export type RecommendationPickResponse = {
    title: string;
    poster: string;
    release_year: number;
    predicted_rating: number;
    url: string;
};
