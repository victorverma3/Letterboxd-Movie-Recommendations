import { useContext } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import Typography from "@mui/material/Typography";

import DefinitionModal from "./Modals/DefinitionModal";
import DiscreteSlider from "./Selection/DiscreteSlider";
import MultiSelectDropdown from "./Selection/MultiSelectDropdown";

import { MovieFilterContext } from "../contexts/MovieFilterContext";

const Filters = () => {
    const context = useContext(MovieFilterContext);
    if (!context) {
        throw new Error(
            "Movie filters must be used within a MovieFilterProvider"
        );
    }
    const [state, dispatch] = context;

    const popularityMarks = [
        { value: 1 },
        { value: 2 },
        { value: 3 },
        { value: 4 },
        { value: 5 },
        { value: 6 },
    ];

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

    const filterDefinitions = {
        Popularity:
            "Filters by popularity. From left to right, the options are the top 100%, 70%, 40%, 20%, 10%, and 5% most popular movies, from a selection of about 50,000.",
        "Release Year":
            "Filters by release year. Includes movies that were released within the specified range (inclusive). The default range is from 1920 to present.",
        Genres: "Filters by genre. Movies can usually be recommended if any of its genres are selected. Animation, documentary, and horror genres will only be recommended if selected. Movies whose only genre is music are excluded by default.",
        Runtime:
            "Filters by runtime (minutes). Includes movies that have a runtime within the specified range (inclusive). The default range is from 0 minutes to 1200 minutes.",
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
                            <h6 className="w-fit my-auto text-xl">
                                Popularity
                            </h6>
                            <DefinitionModal
                                title={"Popularity"}
                                definition={filterDefinitions["Popularity"]}
                            />
                        </div>
                        <div className="mt-2">
                            <DiscreteSlider
                                width="95%"
                                label="Popularity"
                                value={state.popularity}
                                setValue={(value) =>
                                    dispatch({
                                        type: "setPopularity",
                                        payload: { popularity: value },
                                    })
                                }
                                marks={popularityMarks}
                            />
                        </div>
                    </div>
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
                </div>
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
                            <h6 className="w-fit my-auto text-xl">
                                Popularity
                            </h6>
                            <DefinitionModal
                                title={"Popularity"}
                                definition={filterDefinitions["Popularity"]}
                            />
                        </div>
                        <DiscreteSlider
                            width="95%"
                            label="Popularity"
                            value={state.popularity}
                            setValue={(value) =>
                                dispatch({
                                    type: "setPopularity",
                                    payload: { popularity: value },
                                })
                            }
                            marks={popularityMarks}
                        />
                    </AccordionDetails>
                    <AccordionDetails className="w-4/5 mx-auto">
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
                    </AccordionDetails>
                    <AccordionDetails className="w-4/5 mx-auto">
                        <div className="flex justify-center">
                            <h6 className="w-fit my-auto text-xl">Runtime</h6>
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
