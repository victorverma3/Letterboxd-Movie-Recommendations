import Checkbox from "@mui/material/Checkbox";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";

interface CustomCheckboxProps {
    label: string;
    labelPlacement: "start" | "top" | "end" | "bottom";
    checked: boolean;
    setChecked: (checked: boolean) => void;
}

const CustomCheckbox = ({
    label,
    labelPlacement,
    checked,
    setChecked,
}: CustomCheckboxProps) => {
    return (
        <FormControl component="fieldset">
            <FormGroup aria-label="position" row>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={checked}
                            onChange={(
                                event: React.ChangeEvent<HTMLInputElement>
                            ) => {
                                setChecked(event.target.checked);
                            }}
                        />
                    }
                    label={label}
                    labelPlacement={labelPlacement}
                />
            </FormGroup>
        </FormControl>
    );
};

export default CustomCheckbox;
