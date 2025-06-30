interface PatchNotesProps {
    key: number;
    release: string;
    date: string;
    notes: string[];
}

const PatchNotes = (props: PatchNotesProps) => {
    return (
        <div className="flex flex-col space-y-2">
            <h2 className="text-bold text-xl sm:text-2xl underline decoration-palette-darkbrown">
                {props.release}
            </h2>
            <p className="my-auto">{props.date}</p>
            <ul className="pl-6 py-1 list-disc rounded-md bg-gray-200">
                {props.notes.map((bullet, index) => (
                    <li
                        key={index}
                        className="mx-auto py-1 pr-2 text-justify sm:text-start text-xs sm:text-sm"
                    >
                        {bullet}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PatchNotes;
