import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

import DiscreteSlider from "./DiscreteSlider";
import FilterDefinitions from "./FilterDefinitions";
import MultiSelectDropdown from "./MultiSelectDropdown";

type Option = {
    label: string;
    value: string;
    disabled?: boolean;
};

interface FiltersProps {
    popularity: number;
    setPopularity: (value: number) => void;
    values: Option[];
    setValues: (values: Option[]) => void;
}

const Filters = ({
    popularity,
    setPopularity,
    values,
    setValues,
}: FiltersProps) => {
    return (
        <div className="w-4/5 sm:w-3/5 min-w-24 sm:min-w-96 mx-auto mt-16 sm:mt-24 flex flex-col">
            <div className="w-4/5 sm:w-96 mx-auto">
                <Accordion>
                    <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
                        <Typography variant="button">Filters</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography align="center" variant="h6">
                            Popularity
                        </Typography>
                        <DiscreteSlider
                            width="80%"
                            label="Popularity"
                            value={popularity}
                            setValue={setPopularity}
                            step={1}
                            min={0}
                            max={4}
                        />
                    </AccordionDetails>
                    <AccordionDetails className="w-4/5 mx-auto">
                        <Typography align="center" variant="h6">
                            Genres
                        </Typography>
                        <MultiSelectDropdown
                            options={[
                                { label: "Action", value: "is_action" },
                                { label: "Adventure", value: "is_adventure" },
                                { label: "Animation", value: "is_animation" },
                                { label: "Comedy", value: "is_comedy" },
                                { label: "Crime", value: "is_crime" },
                                {
                                    label: "Documentary",
                                    value: "is_documentary",
                                },
                                { label: "Drama", value: "is_drama" },
                                { label: "Family", value: "is_family" },
                                { label: "Fantasy", value: "is_fantasy" },
                                { label: "History", value: "is_history" },
                                { label: "Horror", value: "is_horror" },
                                { label: "Music", value: "is_music" },
                                { label: "Mystery", value: "is_mystery" },
                                { label: "Romance", value: "is_romance" },
                                {
                                    label: "Science Fiction",
                                    value: "is_science_fiction",
                                },
                                { label: "TV Movie", value: "is_tv_movie" },
                                { label: "Thriller", value: "is_thriller" },
                                { label: "War", value: "is_war" },
                                { label: "Western", value: "is_western" },
                            ]}
                            label="Select.."
                            values={values}
                            setValues={setValues}
                            disableSearch={true}
                        />
                    </AccordionDetails>
                </Accordion>
                <FilterDefinitions />
            </div>
        </div>
    );
};

export default Filters;
