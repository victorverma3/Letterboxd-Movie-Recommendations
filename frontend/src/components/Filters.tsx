import { useContext } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import Typography from "@mui/material/Typography";

import DefinitionModal from "./Modals/DefinitionModal";
import MultiSelectDropdown from "./Selection/MultiSelectDropdown";

import { MovieFilterContext } from "../contexts/MovieFilterContext";

interface FiltersProps {
    allowRewatches: boolean;
}

const Filters = ({ allowRewatches }: FiltersProps) => {
    const context = useContext(MovieFilterContext);
    if (!context) {
        throw new Error(
            "Movie filters must be used within a MovieFilterProvider"
        );
    }
    const [state, dispatch] = context;

    const genreOptions = [
        { label: "Action", value: "action" },
        { label: "Adventure", value: "adventure" },
        { label: "Animation", value: "animation" },
        { label: "Comedy", value: "comedy" },
        { label: "Crime", value: "crime" },
        {
            label: "Documentary",
            value: "documentary",
        },
        { label: "Drama", value: "drama" },
        { label: "Family", value: "family" },
        { label: "Fantasy", value: "fantasy" },
        { label: "History", value: "history" },
        { label: "Horror", value: "horror" },
        { label: "Music", value: "music" },
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
    ];

    const contentTypeOptions = [
        { label: "Movie", value: "movie" },
        { label: "TV", value: "tv" },
    ];

    const popularityOptions = [
        { label: "Low", value: "low" },
        { label: "Medium", value: "medium" },
        { label: "High", value: "high" },
    ];

    const filterDefinitions = {
        Genres: "Filters by genre. Movies can usually be recommended if any of its genres are selected. Animation, documentary, and horror genres will only be recommended if selected. Movies whose only genre is music are excluded by default.",
        "Content Types":
            "Filters by content type. The options are movie and TV, as defined by TMDB. Movies are recommended by default.",
        "Release Year":
            "Filters by release year. Includes movies that were released within the specified range (inclusive).",
        Runtime:
            "Filters by runtime (minutes). Includes movies that have a runtime within the specified range (inclusive).",
        Popularity:
            "Filters by popularity, based on the number of Letterboxd ratings. Low includes movies with less than 25,000 ratings, medium includes movies with 25,000-100,000 ratings, and high includes movies with more than 100,000 ratings. Movies with any popularity are considered by default.",
        "Highly Rated":
            "Filters by highly rated movies. If toggled on, only movies with a Letterboxd community rating of 3.5 or greater can be recommended. All ratings are included by default.",
        Watchlist:
            "Filters by watchlist. If toggled on, movies on the user's watchlist will be included. Note that toggling this option off will increase response time. Watchlist is included by default.",
        Rewatches:
            "Filters by rewatches. If toggled on, rewatches can be recommended. This is intended for group settings to allow suggestions that only a subset of the group might have seen. Rewatches are excluded by default.",
    };

    const resetFilters = () => {
        dispatch({
            type: "reset",
        });
    };
    return (
        <div className="w-fit mx-auto mt-8 flex flex-col">
            <div className="hidden md:w-128 mx-auto md:flex md:flex-col md:space-y-4">
                <div className="flex justify-around">
                    <div className="w-48">
                        <div className="flex justify-center">
                            <h6 className="w-fit my-auto text-xl">Genres</h6>
                            <DefinitionModal
                                title={"Genres"}
                                definition={filterDefinitions["Genres"]}
                            />
                        </div>
                        <MultiSelectDropdown
                            options={genreOptions}
                            label="Select.."
                            values={state.genres}
                            setValues={(selectedOptions) =>
                                selectedOptions &&
                                dispatch({
                                    type: "setGenres",
                                    payload: {
                                        genres: selectedOptions,
                                    },
                                })
                            }
                            disableSearch={true}
                        />
                    </div>
                    <div className="w-48">
                        <div className="flex justify-center">
                            <h6 className="w-fit my-auto text-xl">
                                Content Types
                            </h6>
                            <DefinitionModal
                                title={"Content Types"}
                                definition={filterDefinitions["Content Types"]}
                            />
                        </div>
                        <MultiSelectDropdown
                            options={contentTypeOptions}
                            label="Select.."
                            values={state.contentTypes}
                            setValues={(selectedOptions) =>
                                selectedOptions &&
                                dispatch({
                                    type: "setContentTypes",
                                    payload: {
                                        contentTypes: selectedOptions,
                                    },
                                })
                            }
                            disableSearch={true}
                        />
                    </div>
                </div>
                <div className="flex justify-around">
                    <div className="w-48">
                        <div className="flex justify-center">
                            <h6 className="w-fit my-auto text-xl">
                                Release Year
                            </h6>
                            <DefinitionModal
                                title={"Release Year"}
                                definition={filterDefinitions["Release Year"]}
                            />
                        </div>
                        <div className="mt-2 flex justify-around">
                            <input
                                className="w-20 text-center border-2 border-gray-300 rounded-md"
                                type="text"
                                value={state.minReleaseYear}
                                onChange={(event) =>
                                    dispatch({
                                        type: "setMinReleaseYear",
                                        payload: {
                                            minReleaseYear: event.target.value,
                                        },
                                    })
                                }
                            />
                            <p>to</p>
                            <input
                                className="w-20 text-center border-2 border-gray-300 rounded-md"
                                type="text"
                                value={state.maxReleaseYear}
                                onChange={(event) =>
                                    dispatch({
                                        type: "setMaxReleaseYear",
                                        payload: {
                                            maxReleaseYear: event.target.value,
                                        },
                                    })
                                }
                            />
                        </div>
                    </div>
                    <div className="w-48">
                        <div className="flex justify-center">
                            <h6 className="w-fit my-auto text-xl">Runtime</h6>
                            <DefinitionModal
                                title={"Runtime"}
                                definition={filterDefinitions["Runtime"]}
                            />
                        </div>
                        <div className="mt-2 flex justify-around">
                            <input
                                className="w-20 text-center border-2 border-gray-300 rounded-md"
                                type="text"
                                value={state.minRuntime}
                                onChange={(event) =>
                                    dispatch({
                                        type: "setMinRuntime",
                                        payload: {
                                            minRuntime: event.target.value,
                                        },
                                    })
                                }
                            />
                            <p>to</p>
                            <input
                                className="w-20 text-center border-2 border-gray-300 rounded-md"
                                type="text"
                                value={state.maxRuntime}
                                onChange={(event) =>
                                    dispatch({
                                        type: "setMaxRuntime",
                                        payload: {
                                            maxRuntime: event.target.value,
                                        },
                                    })
                                }
                            />
                        </div>
                    </div>
                </div>
                <div className="flex justify-around">
                    <div className="w-48">
                        <div className="flex justify-center">
                            <h6 className="w-fit my-auto text-xl">
                                Popularity
                            </h6>
                            <DefinitionModal
                                title={"Popularity"}
                                definition={filterDefinitions["Popularity"]}
                            />
                        </div>
                        <div className="mt-2">
                            <MultiSelectDropdown
                                options={popularityOptions}
                                label="Select.."
                                values={state.popularity}
                                setValues={(selectedOptions) =>
                                    selectedOptions &&
                                    dispatch({
                                        type: "setPopularity",
                                        payload: {
                                            popularity: selectedOptions,
                                        },
                                    })
                                }
                                disableSearch={true}
                            />
                        </div>
                    </div>
                    <div className="w-48">
                        <div className="flex justify-center">
                            <h6 className="w-fit my-auto text-xl">
                                Highly Rated
                            </h6>
                            <DefinitionModal
                                title={"Highly Rated"}
                                definition={filterDefinitions["Highly Rated"]}
                            />
                        </div>
                        <button
                            type="button"
                            className={`w-20 block mt-2 mx-auto p-2 rounded-md hover:shadow-md  ${
                                state.highlyRated
                                    ? "bg-palette-lightbrown"
                                    : "bg-gray-200"
                            }`}
                            onClick={() =>
                                dispatch({
                                    type: "setHighlyRated",
                                    payload: {
                                        highlyRated: !state.highlyRated,
                                    },
                                })
                            }
                        >
                            {state.highlyRated ? "On" : "Off"}
                        </button>
                    </div>
                </div>
                <div className="flex justify-around">
                    <div className="w-48">
                        <div className="flex justify-center">
                            <h6 className="w-fit my-auto text-xl">Watchlist</h6>
                            <DefinitionModal
                                title={"Watchlist"}
                                definition={filterDefinitions["Watchlist"]}
                            />
                        </div>
                        <button
                            type="button"
                            className={`w-20 block mt-2 mx-auto p-2 rounded-md hover:shadow-md  ${
                                state.includeWatchlist
                                    ? "bg-palette-lightbrown"
                                    : "bg-gray-200"
                            }`}
                            onClick={() =>
                                dispatch({
                                    type: "setIncludeWatchlist",
                                    payload: {
                                        includeWatchlist:
                                            !state.includeWatchlist,
                                    },
                                })
                            }
                        >
                            {state.includeWatchlist ? "On" : "Off"}
                        </button>
                    </div>
                    {allowRewatches && (
                        <div className="w-48">
                            <div className="flex justify-center">
                                <h6 className="w-fit my-auto text-xl">
                                    Rewatches
                                </h6>
                                <DefinitionModal
                                    title={"Rewatches"}
                                    definition={filterDefinitions["Rewatches"]}
                                />
                            </div>
                            <button
                                type="button"
                                className={`w-20 block mt-2 mx-auto p-2 rounded-md hover:shadow-md  ${
                                    state.allowRewatches
                                        ? "bg-palette-lightbrown"
                                        : "bg-gray-200"
                                }`}
                                onClick={() =>
                                    dispatch({
                                        type: "setAllowRewatches",
                                        payload: {
                                            allowRewatches:
                                                !state.allowRewatches,
                                        },
                                    })
                                }
                            >
                                {state.allowRewatches ? "On" : "Off"}
                            </button>
                        </div>
                    )}
                </div>
                <button
                    className="block mx-auto p-2 rounded-md hover:shadow-md bg-gray-200 hover:bg-palette-lightbrown"
                    type="reset"
                    onClick={resetFilters}
                >
                    Reset Filters
                </button>
            </div>

            <div className="w-64 sm:w-96 md:hidden mx-auto">
                <Accordion>
                    <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
                        <Typography variant="button">Filters</Typography>
                    </AccordionSummary>
                    <AccordionDetails className="w-4/5 mx-auto">
                        <div className="flex justify-center">
                            <h6 className="w-fit my-auto text-lg">Genres</h6>
                            <DefinitionModal
                                title={"Genres"}
                                definition={filterDefinitions["Genres"]}
                            />
                        </div>
                        <MultiSelectDropdown
                            options={genreOptions}
                            label="Select.."
                            values={state.genres}
                            setValues={(selectedOptions) =>
                                selectedOptions &&
                                dispatch({
                                    type: "setGenres",
                                    payload: {
                                        genres: selectedOptions,
                                    },
                                })
                            }
                            disableSearch={true}
                        />
                    </AccordionDetails>
                    <AccordionDetails className="w-4/5 mx-auto">
                        <div className="flex justify-center">
                            <h6 className="w-fit my-auto text-lg">
                                Content Types
                            </h6>
                            <DefinitionModal
                                title={"Content Types"}
                                definition={filterDefinitions["Content Types"]}
                            />
                        </div>
                        <MultiSelectDropdown
                            options={contentTypeOptions}
                            label="Select.."
                            values={state.contentTypes}
                            setValues={(selectedOptions) =>
                                selectedOptions &&
                                dispatch({
                                    type: "setContentTypes",
                                    payload: {
                                        contentTypes: selectedOptions,
                                    },
                                })
                            }
                            disableSearch={true}
                        />
                    </AccordionDetails>
                    <AccordionDetails className="w-4/5 mx-auto">
                        <div className="flex justify-center">
                            <h6 className="w-fit my-auto text-lg">
                                Release Year
                            </h6>
                            <DefinitionModal
                                title={"Release Year"}
                                definition={filterDefinitions["Release Year"]}
                            />
                        </div>
                        <div className="mt-2 flex justify-around">
                            <input
                                className="w-16 sm:w-20 text-center border-2 border-gray-300 rounded-md"
                                type="text"
                                value={state.minReleaseYear}
                                onChange={(event) =>
                                    dispatch({
                                        type: "setMinReleaseYear",
                                        payload: {
                                            minReleaseYear: event.target.value,
                                        },
                                    })
                                }
                            />
                            <p>to</p>
                            <input
                                className="w-16 sm:w-20 text-center border-2 border-gray-300 rounded-md"
                                type="text"
                                value={state.maxReleaseYear}
                                onChange={(event) =>
                                    dispatch({
                                        type: "setMaxReleaseYear",
                                        payload: {
                                            maxReleaseYear: event.target.value,
                                        },
                                    })
                                }
                            />
                        </div>
                    </AccordionDetails>
                    <AccordionDetails className="w-4/5 mx-auto">
                        <div className="flex justify-center">
                            <h6 className="w-fit my-auto text-lg">Runtime</h6>
                            <DefinitionModal
                                title={"Runtime"}
                                definition={filterDefinitions["Runtime"]}
                            />
                        </div>
                        <div className="mt-2 flex justify-around">
                            <input
                                className="w-16 sm:w-20 text-center border-2 border-gray-300 rounded-md"
                                type="text"
                                value={state.minRuntime}
                                onChange={(event) =>
                                    dispatch({
                                        type: "setMinRuntime",
                                        payload: {
                                            minRuntime: event.target.value,
                                        },
                                    })
                                }
                            />
                            <p>to</p>
                            <input
                                className="w-16 sm:w-20 text-center border-2 border-gray-300 rounded-md"
                                type="text"
                                value={state.maxRuntime}
                                onChange={(event) =>
                                    dispatch({
                                        type: "setMaxRuntime",
                                        payload: {
                                            maxRuntime: event.target.value,
                                        },
                                    })
                                }
                            />
                        </div>
                    </AccordionDetails>
                    <AccordionDetails className="w-4/5 mx-auto">
                        <div className="flex justify-center">
                            <h6 className="w-fit my-auto text-lg">
                                Popularity
                            </h6>
                            <DefinitionModal
                                title={"Popularity"}
                                definition={filterDefinitions["Popularity"]}
                            />
                        </div>
                        <MultiSelectDropdown
                            options={popularityOptions}
                            label="Select.."
                            values={state.popularity}
                            setValues={(selectedOptions) =>
                                selectedOptions &&
                                dispatch({
                                    type: "setPopularity",
                                    payload: {
                                        popularity: selectedOptions,
                                    },
                                })
                            }
                            disableSearch={true}
                        />
                    </AccordionDetails>
                    <AccordionDetails className="w-4/5 mx-auto">
                        <div className="flex justify-center">
                            <h6 className="w-fit my-auto text-xl">
                                Highly Rated
                            </h6>
                            <DefinitionModal
                                title={"Highly Rated"}
                                definition={filterDefinitions["Highly Rated"]}
                            />
                        </div>
                        <button
                            type="button"
                            className={`w-20 block mt-2 mx-auto p-2 rounded-md hover:shadow-md  ${
                                state.highlyRated
                                    ? "bg-palette-lightbrown"
                                    : "bg-gray-200"
                            }`}
                            onClick={() =>
                                dispatch({
                                    type: "setHighlyRated",
                                    payload: {
                                        highlyRated: !state.highlyRated,
                                    },
                                })
                            }
                        >
                            {state.highlyRated ? "On" : "Off"}
                        </button>
                    </AccordionDetails>
                    <AccordionDetails className="w-4/5 mx-auto">
                        <div className="flex justify-around">
                            <div className="w-48">
                                <div className="flex justify-center">
                                    <h6 className="w-fit my-auto text-xl">
                                        Watchlist
                                    </h6>
                                    <DefinitionModal
                                        title={"Watchlist"}
                                        definition={
                                            filterDefinitions["Watchlist"]
                                        }
                                    />
                                </div>
                                <button
                                    type="button"
                                    className={`w-20 block mt-2 mx-auto p-2 rounded-md hover:shadow-md  ${
                                        state.includeWatchlist
                                            ? "bg-palette-lightbrown"
                                            : "bg-gray-200"
                                    }`}
                                    onClick={() =>
                                        dispatch({
                                            type: "setIncludeWatchlist",
                                            payload: {
                                                includeWatchlist:
                                                    !state.includeWatchlist,
                                            },
                                        })
                                    }
                                >
                                    {state.includeWatchlist ? "On" : "Off"}
                                </button>
                            </div>
                        </div>
                    </AccordionDetails>
                    {allowRewatches && (
                        <AccordionDetails className="w-4/5 mx-auto">
                            <div className="flex justify-around">
                                <div className="w-48">
                                    <div className="flex justify-center">
                                        <h6 className="w-fit my-auto text-xl">
                                            Rewatches
                                        </h6>
                                        <DefinitionModal
                                            title={"Rewatches"}
                                            definition={
                                                filterDefinitions["Rewatches"]
                                            }
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        className={`w-20 block mt-2 mx-auto p-2 rounded-md hover:shadow-md  ${
                                            state.allowRewatches
                                                ? "bg-palette-lightbrown"
                                                : "bg-gray-200"
                                        }`}
                                        onClick={() =>
                                            dispatch({
                                                type: "setAllowRewatches",
                                                payload: {
                                                    allowRewatches:
                                                        !state.allowRewatches,
                                                },
                                            })
                                        }
                                    >
                                        {state.allowRewatches ? "On" : "Off"}
                                    </button>
                                </div>
                            </div>
                        </AccordionDetails>
                    )}
                    <AccordionDetails className="w-4/5 mx-auto">
                        <Typography variant="button">
                            <button
                                className="block mx-auto p-2 rounded-md hover:shadow-md bg-gray-200 hover:bg-palette-lightbrown"
                                onClick={resetFilters}
                            >
                                Reset Filters
                            </button>
                        </Typography>
                    </AccordionDetails>
                </Accordion>
            </div>
        </div>
    );
};

export default Filters;
