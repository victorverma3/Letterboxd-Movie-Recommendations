interface HorizontalDividerProps {
    color: "darkbrown" | "brown" | "lightbrown";
}

const HorizontalDivider = ({ color }: HorizontalDividerProps) => {
    return (
        <hr
            className={`h-px border-0 ${
                color === "darkbrown"
                    ? "bg-palette-darkbrown"
                    : color === "brown"
                    ? "bg-palette-brown"
                    : "bg-palette-lightbrown"
            }`}
        />
    );
};

export default HorizontalDivider;
