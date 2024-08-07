import { useContext } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import Select from "react-select";
import Typography from "@mui/material/Typography";

import DefinitionsModal from "./DefinitionsModal";
import DiscreteSlider from "./DiscreteSlider";
import { MovieFilterContext } from "../contexts/MovieFilterContext";
import MultiSelectDropdown from "./MultiSelectDropdown";

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

    const releaseYearMarks = [
        { value: 1880 },
        { value: 1920 },
        { value: 1950 },
        { value: 1970 },
        { value: 1990 },
        { value: 2010 },
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

    const runtimeOptions = [
        { value: 40, label: "Short Film" },
        { value: 90, label: "90 Min or Less" },
        { value: 150, label: "150 Min or Less" },
        { value: -1, label: "Any" },
    ];

    const filterDefinitions = [
        {
            term: "Popularity",
            definition:
                ": Filters by popularity. The options from left to right choose from the top 100%, 70%, 40%, 20%, 10%, and 5% most popular movies, with approximately 40,000 total movies in the database.",
        },
        {
            term: "Release Year",
            definition:
                ": Filters by movies that were released after the specified year (inclusive).",
        },
        {
            term: "Genres",
            definition:
                ": Filters by genre. Movies can usually be recommended if any of its genres are selected. Animation, documentary, and horror genres will only be recommended if they are selected. Movies whose only genre is music are excluded by default.",
        },
        {
            term: "Runtime",
            definition:
                ": Filters by runtime. Short films are defined as 40 minutes or less.",
        },
    ];

    const resetFilters = () => {
        dispatch({
            type: "reset",
        });
    };
    return (
        <div className="w-11/12 sm:w-3/5 min-w-24 sm:min-w-96 mx-auto mt-8 sm:mt-16 flex flex-col">
            <div className="w-4/5 sm:w-96 mx-auto">
                <Accordion>
                    <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
                        <Typography variant="button">Filters</Typography>
                    </AccordionSummary>
                    <AccordionDetails className="w-4/5 mx-auto">
                        <Typography align="center" variant="h6">
                            Popularity
                        </Typography>
                        <DiscreteSlider
                            width="100%"
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
                        <Typography align="center" variant="h6">
                            Release Year
                        </Typography>
                        <DiscreteSlider
                            width="100%"
                            label="Release Year"
                            value={state.releaseYear}
                            setValue={(value) =>
                                dispatch({
                                    type: "setReleaseYear",
                                    payload: { releaseYear: value },
                                })
                            }
                            marks={releaseYearMarks}
                        />
                    </AccordionDetails>
                    <AccordionDetails className="w-4/5 mx-auto">
                        <Typography align="center" variant="h6">
                            Genres
                        </Typography>
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
                        <Typography align="center" variant="h6">
                            Runtime
                        </Typography>
                        <Select
                            options={runtimeOptions}
                            value={state.runtime}
                            onChange={(selectedOption) =>
                                selectedOption &&
                                dispatch({
                                    type: "setRuntime",
                                    payload: { runtime: selectedOption },
                                })
                            }
                            isSearchable={false}
                        />
                    </AccordionDetails>
                    <AccordionDetails className="w-4/5 mx-auto">
                        <Typography variant="button">
                            <button
                                className="block mx-auto p-2 border-2 rounded-md hover:border-amber-800"
                                onClick={resetFilters}
                            >
                                Reset Filters
                            </button>
                        </Typography>
                    </AccordionDetails>
                </Accordion>
                <DefinitionsModal
                    title={"Filter Definitions"}
                    definitions={filterDefinitions}
                />
            </div>
        </div>
    );
};

export default Filters;
