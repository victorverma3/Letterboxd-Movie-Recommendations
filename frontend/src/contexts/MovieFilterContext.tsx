import { createContext, Dispatch, useReducer } from "react";

import { Genre, Runtime, State } from "../types/ContextTypes";

type MovieFilterContext = [State, Dispatch<Action>];

export const MovieFilterContext = createContext<MovieFilterContext | undefined>(
    undefined
);

const initialState = {
    popularity: 4,
    startReleaseYear: "1920",
    endReleaseYear: new Date().getFullYear().toString(),
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
    runtime: {
        value: -1,
        label: "Any",
    },
};

type Action =
    | { type: "setPopularity"; payload: { popularity: number } }
    | { type: "setStartReleaseYear"; payload: { startReleaseYear: string } }
    | { type: "setEndReleaseYear"; payload: { endReleaseYear: string } }
    | { type: "setGenres"; payload: { genres: Genre[] } }
    | { type: "setRuntime"; payload: { runtime: Runtime } }
    | {
          type: "reset";
      };

function movieFilterReducer(state: State, action: Action) {
    switch (action.type) {
        case "setPopularity":
            return {
                ...state,
                popularity: action.payload.popularity,
            };
        case "setStartReleaseYear":
            return {
                ...state,
                startReleaseYear: action.payload.startReleaseYear,
            };
        case "setEndReleaseYear":
            return {
                ...state,
                endReleaseYear: action.payload.endReleaseYear,
            };
        case "setGenres":
            return {
                ...state,
                genres: action.payload.genres,
            };
        case "setRuntime":
            return {
                ...state,
                runtime: action.payload.runtime,
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
