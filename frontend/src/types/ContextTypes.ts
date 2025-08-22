export type ContentType = {
    label: string;
    value: string;
    disabled?: boolean;
};

export type FilterState = {
    genres: GenreType[];
    contentTypes: ContentType[];
    minReleaseYear: string;
    maxReleaseYear: string;
    minRuntime: string;
    maxRuntime: string;
    popularity: number;
    highlyRated: boolean;
    modelType: ModelType;
    description: string;
};

export type GenreType = {
    label: string;
    value: string;
    disabled?: boolean;
};

export type ModelType = {
    label: string;
    value: string;
    disabled?: boolean;
};
