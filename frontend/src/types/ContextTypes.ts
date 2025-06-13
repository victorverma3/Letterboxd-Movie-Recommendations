export type ContentType = {
    label: string;
    value: string;
    disabled?: boolean;
};

export type Genre = {
    label: string;
    value: string;
    disabled?: boolean;
};

export type FilterState = {
    genres: Genre[];
    contentTypes: ContentType[];
    minReleaseYear: string;
    maxReleaseYear: string;
    minRuntime: string;
    maxRuntime: string;
    popularity: number;
};
