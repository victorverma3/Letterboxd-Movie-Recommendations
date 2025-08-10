import { useContext, useEffect, useRef } from "react";

import DefinitionModal from "./Modals/DefinitionModal";

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
        <div className="w-fit mt-8 m-auto flex flex-col gap-2">
            <div className="flex justify-center">
                <h6 className="w-fit my-auto text-xl">Description</h6>
                <DefinitionModal
                    title={"Description"}
                    definition="The user describes what they want to watch using natural language. The description is processed by OpenAI's GPT-5 Nano to produce the filters that best match the user's input."
                />
            </div>
            <textarea
                className="w-64 sm:w-96 resize-none mx-auto p-1 text-center rounded-md bg-gray-200"
                rows={1}
                ref={descriptionRef}
                id="description"
                name="description"
                placeholder="What do you want to watch?"
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
