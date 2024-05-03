import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

import DiscreteSlider from "./DiscreteSlider";

interface FiltersProps {
    popularity: number;
    setPopularity: (value: number) => void;
}

const Filters = ({ popularity, setPopularity }: FiltersProps) => {
    return (
        <div className="w-4/5 sm:w-3/5 min-w-24 sm:min-w-96 mx-auto mt-16 flex flex-col">
            <div className="w-4/5 sm:w-96 mx-auto">
                <Accordion>
                    <AccordionSummary
                        expandIcon={<ArrowDropDownIcon />}
                        aria-controls="panel1-content"
                        id="panel1-header"
                    >
                        <Typography>
                            <h2>Filters</h2>
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <div>
                            <Typography>
                                <h3 className="w-fit mx-auto">Popularity</h3>
                                <DiscreteSlider
                                    width="80%"
                                    label="Popularity"
                                    value={popularity}
                                    setValue={setPopularity}
                                    step={1}
                                    min={0}
                                    max={4}
                                />
                            </Typography>
                        </div>
                    </AccordionDetails>
                </Accordion>
            </div>
        </div>
    );
};

export default Filters;
