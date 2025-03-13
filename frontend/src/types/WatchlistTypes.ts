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

export type PickRandomResponse = {
    title: string;
    poster: string;
    url: string;
    release_year: number;
};

export type PickRecommendationResponse = {
    title: string;
    poster: string;
    release_year: number;
    predicted_rating: number;
    url: string;
};

export type PickQuery = {
    usernames: string[];
    overlap: string;
    pick_type: "random" | "recommendation";
    num_picks: number;
};
