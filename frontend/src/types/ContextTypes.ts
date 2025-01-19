export type Genre = {
    label: string;
    value: string;
    disabled?: boolean;
};

export type Runtime = {
    value: number;
    label: string;
};

export type State = {
    popularity: number;
    startReleaseYear: string;
    endReleaseYear: string;
    genres: Genre[];
    runtime: Runtime;
};
