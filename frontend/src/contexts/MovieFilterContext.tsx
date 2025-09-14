import { createContext, Dispatch, useReducer } from "react";

import {
    ContentType,
    FilterState,
    GenreType,
    ModelType,
    PopularityType,
} from "../types/ContextTypes";

type MovieFilterContext = [FilterState, Dispatch<Action>];

export const MovieFilterContext = createContext<MovieFilterContext | undefined>(
    undefined
);

const initialState = {
    genres: [
        { label: "Action", value: "action" },
        { label: "Adventure", value: "adventure" },
        { label: "Animation", value: "animation" },
        { label: "Comedy", value: "comedy" },
        { label: "Crime", value: "crime" },
        { label: "Drama", value: "drama" },
        { label: "Family", value: "family" },
        { label: "Fantasy", value: "fantasy" },
        { label: "History", value: "history" },
        { label: "Horror", value: "horror" },
        { label: "Mystery", value: "mystery" },
        { label: "Romance", value: "romance" },
        {
            label: "Science Fiction",
            value: "science_fiction",
        },
        { label: "TV Movie", value: "tv_movie" },
        { label: "Thriller", value: "thriller" },
        { label: "War", value: "war" },
        { label: "Western", value: "western" },
    ],
    contentTypes: [{ label: "Movie", value: "movie" }],
    minReleaseYear: "1920",
    maxReleaseYear: new Date().getFullYear().toString(),
    minRuntime: "0",
    maxRuntime: "1200",
    popularity: [
        { label: "Low", value: "low" },
        { label: "Medium", value: "medium" },
        { label: "High", value: "high" },
    ],
    highlyRated: false,
    allowRewatches: false,
    modelType: { label: "Personalized", value: "personalized" },
    description: "",
};

type Action =
    | { type: "setGenres"; payload: { genres: GenreType[] } }
    | { type: "setContentTypes"; payload: { contentTypes: ContentType[] } }
    | { type: "setMinReleaseYear"; payload: { minReleaseYear: string } }
    | { type: "setMaxReleaseYear"; payload: { maxReleaseYear: string } }
    | { type: "setMinRuntime"; payload: { minRuntime: string } }
    | { type: "setMaxRuntime"; payload: { maxRuntime: string } }
    | { type: "setPopularity"; payload: { popularity: PopularityType[] } }
    | { type: "setHighlyRated"; payload: { highlyRated: boolean } }
    | { type: "setAllowRewatches"; payload: { allowRewatches: boolean } }
    | { type: "setModelType"; payload: { modelType: ModelType } }
    | { type: "setDescription"; payload: { description: string } }
    | {
          type: "reset";
      };

function movieFilterReducer(state: FilterState, action: Action) {
    switch (action.type) {
        case "setGenres":
            return {
                ...state,
                genres: action.payload.genres,
            };
        case "setContentTypes":
            return {
                ...state,
                contentTypes: action.payload.contentTypes,
            };
        case "setMinReleaseYear":
            return {
                ...state,
                minReleaseYear: action.payload.minReleaseYear,
            };
        case "setMaxReleaseYear":
            return {
                ...state,
                maxReleaseYear: action.payload.maxReleaseYear,
            };
        case "setMinRuntime":
            return {
                ...state,
                minRuntime: action.payload.minRuntime,
            };
        case "setMaxRuntime":
            return {
                ...state,
                maxRuntime: action.payload.maxRuntime,
            };
        case "setPopularity":
            return {
                ...state,
                popularity: action.payload.popularity,
            };
        case "setHighlyRated":
            return {
                ...state,
                highlyRated: action.payload.highlyRated,
            };
        case "setAllowRewatches":
            return {
                ...state,
                allowRewatches: action.payload.allowRewatches,
            };
        case "setModelType":
            return {
                ...state,
                modelType: action.payload.modelType,
            };
        case "setDescription":
            return {
                ...state,
                description: action.payload.description,
            };
        case "reset":
            return initialState;
        default:
            return state;
    }
}

interface MovieFilterProviderProps {
    children: React.ReactNode;
}

const MovieFilterProvider = ({ children }: MovieFilterProviderProps) => {
    const [state, dispatch] = useReducer(movieFilterReducer, initialState);
    return (
        <MovieFilterContext.Provider value={[state, dispatch]}>
            {children}
        </MovieFilterContext.Provider>
    );
};

export default MovieFilterProvider;
