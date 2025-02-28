export type Definition = {
    term: string;
    definition: string;
};

export type Distribution = {
    bin: string;
    user_rating_count: number;
    letterboxd_rating_count: number;
};

export type Option = {
    label: string;
    value: string;
    disabled?: boolean;
};
