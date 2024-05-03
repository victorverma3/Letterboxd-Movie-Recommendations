import { MultiSelect } from "react-multi-select-component";

type Option = {
    label: string;
    value: string;
    disabled?: boolean;
};

interface MultiSelectDropdownProps {
    options: Option[];
    label: string;
    values: Option[];
    setValues: (values: Option[]) => void;
    disableSearch: boolean;
}

const MultiSelectDropdown = ({
    options,
    label,
    values,
    setValues,
    disableSearch,
}: MultiSelectDropdownProps) => {
    return (
        <div>
            <MultiSelect
                options={options}
                value={values}
                hasSelectAll
                onChange={setValues}
                labelledBy={label}
                disableSearch={disableSearch}
            />
        </div>
    );
};

export default MultiSelectDropdown;
