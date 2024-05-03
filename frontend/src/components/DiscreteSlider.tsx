import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";

interface DiscreteSliderProps {
    width: number | string;
    label: string;
    value: number;
    setValue: (value: number) => void;
    step: number;
    min: number;
    max: number;
}

const DiscreteSlider = ({
    width,
    label,
    value,
    setValue,
    step,
    min,
    max,
}: DiscreteSliderProps) => {
    return (
        <Box sx={{ width: width, margin: "auto" }}>
            <Slider
                aria-label={label}
                value={value}
                onChange={(_, value) => setValue(value as number)}
                valueLabelDisplay="auto"
                step={step}
                marks
                min={min}
                max={max}
            />
        </Box>
    );
};

export default DiscreteSlider;
