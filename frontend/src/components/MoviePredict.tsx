import { useContext } from "react";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

import DefinitionModal from "./Modals/DefinitionModal";

import { MovieFilterContext } from "../contexts/MovieFilterContext";

const MoviePredict = () => {
    const context = useContext(MovieFilterContext);
    if (!context) {
        throw new Error(
            "Movie filters must be used within a MovieFilterProvider"
        );
    }
    const [state, dispatch] = context;

    const handleChange = (index: number, value: string) => {
        const newList = [...state.predictionList];
        newList[index] = value;
        dispatch({
            type: "setPredictionList",
            payload: { predictionList: newList },
        });
    };

    const handleAdd = () => {
        if (state.predictionList.length >= 10) return;
        dispatch({
            type: "setPredictionList",
            payload: { predictionList: [...state.predictionList, ""] },
        });
    };

    const handleRemove = (index: number) => {
        const newList = state.predictionList.filter((_, i) => i !== index);
        dispatch({
            type: "setPredictionList",
            payload: { predictionList: newList },
        });
    };

    return (
        <div className="w-fit mt-8 m-auto flex flex-col gap-2">
            <div className="flex justify-center">
                <h6 className="w-fit my-auto text-xl">Prediction</h6>
                <DefinitionModal
                    title={"Prediction"}
                    definition="The user inputs the Letterboxd URLs of the movies for which they want to receive a predicted rating. Check the recommendations section of the FAQ to learn how to get the Letterboxd URL in the app. Note that newly released movies may not be immediately available."
                />
            </div>

            <div>
                {state.predictionList &&
                    state.predictionList.map((url, index) => (
                        <div key={index} className="flex justify-center mb-2">
                            <div className="relative w-64 sm:w-96">
                                <input
                                    className="w-full p-1 text-center rounded-md bg-gray-200"
                                    type="text"
                                    placeholder="Letterboxd URL"
                                    value={url}
                                    onChange={(e) =>
                                        handleChange(index, e.target.value)
                                    }
                                />
                                {index > 0 && (
                                    <RemoveIcon
                                        className="absolute right-1 top-1/2 -translate-y-1/2 cursor-pointer rounded-3xl hover:shadow-md bg-gray-300 hover:bg-palette-lightbrown"
                                        fontSize="medium"
                                        onClick={() => handleRemove(index)}
                                    />
                                )}
                            </div>
                        </div>
                    ))}

                {state.predictionList.length < 10 && (
                    <div className="block w-fit mx-auto mt-2">
                        <AddIcon
                            className="rounded-3xl hover:shadow-md cursor-pointer bg-gray-200 hover:bg-palette-lightbrown"
                            fontSize="medium"
                            onClick={handleAdd}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default MoviePredict;
