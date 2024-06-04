import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";

interface DiscreteSliderProps {
    width: number | string;
    label: string;
    value: number;
    setValue: (value: number) => void;
    marks: { value: number }[];
}

const DiscreteSlider = ({
    width,
    label,
    value,
    setValue,
    marks,
}: DiscreteSliderProps) => {
    const min = Math.min(...marks.map((mark) => mark.value));
    const max = Math.max(...marks.map((mark) => mark.value));
    return (
        <Box sx={{ width: width, margin: "auto" }}>
            <Slider
                aria-label={label}
                value={value}
                onChange={(_, value) => setValue(value as number)}
                valueLabelDisplay="auto"
                marks={marks}
                step={null}
                min={min}
                max={max}
            />
        </Box>
    );
};

export default DiscreteSlider;
