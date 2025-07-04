import Select from "react-select";

import { Option } from "../../types/ComponentTypes";

interface SelectDropdownProps {
    options: Option[];
    value: Option | null;
    setValue: (value: Option | null) => void;
}

const SelectDropdown = ({ options, value, setValue }: SelectDropdownProps) => {
    return (
        <div>
            <Select
                options={options}
                value={value}
                onChange={(selectedOption) => setValue(selectedOption)}
            />
        </div>
    );
};

export default SelectDropdown;
