export type Genre = {
    label: string;
    value: string;
    disabled?: boolean;
};

export type FilterState = {
    popularity: number;
    minReleaseYear: string;
    maxReleaseYear: string;
    genres: Genre[];
    minRuntime: string;
    maxRuntime: string;
};
