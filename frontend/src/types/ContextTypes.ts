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
    popularity: PopularityType[];
    highlyRated: boolean;
    allowRewatches: boolean;
    modelType: ModelType;
    description: string;
    predictionList: string[];
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

export type PopularityType = {
    label: string;
    value: string;
    disabled?: boolean;
};
