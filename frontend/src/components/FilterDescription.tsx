import { useContext, useEffect, useRef } from "react";

import { MovieFilterContext } from "../contexts/MovieFilterContext";

const FilterDescription = () => {
    const context = useContext(MovieFilterContext);
    if (!context) {
        throw new Error(
            "Movie filters must be used within a MovieFilterProvider"
        );
    }
    const [state, dispatch] = context;

    const descriptionRef = useRef<HTMLTextAreaElement>(null);
    useEffect(() => {
        if (descriptionRef.current) {
            descriptionRef.current.style.height = "auto";
            descriptionRef.current.style.height = `${descriptionRef.current.scrollHeight}px`;
        }
    }, [state.description]);

    return (
        <div className="w-fit mt-12 m-auto flex flex-col gap-2">
            <textarea
                className="w-64 sm:w-96 resize-none mx-auto p-1 text-center placeholder:text-sm sm:placeholder:text-base rounded-md bg-gray-200"
                rows={1}
                ref={descriptionRef}
                id="description"
                name="description"
                placeholder="Describe what you want to watch"
                value={state.description}
                onChange={(e) =>
                    dispatch({
                        type: "setDescription",
                        payload: {
                            description: e.target.value,
                        },
                    })
                }
            />
        </div>
    );
};

export default FilterDescription;
