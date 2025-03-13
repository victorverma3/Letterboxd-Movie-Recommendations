import { useState } from "react";
import axios, { AxiosError } from "axios";
import { FieldErrors, useForm } from "react-hook-form";
import { useSnackbar } from "notistack";

import CustomCheckbox from "./Selection/CustomCheckbox";
import LetterboxdAlert from "./Alerts/LetterboxdAlert";
import LinearIndeterminate from "./LinearIndeterminate";
import PickInstructions from "./Modals/PickInstructions";
import WatchlistCard from "./Cards/WatchlistCard";

import {
    PickFormValues,
    PickType,
    RandomPickResponse,
    RecommendationPickResponse,
} from "../types/WatchlistTypes";

const backend = import.meta.env.VITE_BACKEND_URL;

interface getPicksProps {
    userList: string[];
}

const Picks = () => {
    const { enqueueSnackbar } = useSnackbar();
    const [gettingPicks, setGettingPicks] = useState(false);
    const [pickType, setPickType] = useState<PickType>("random");
    const [overlap, setOverlap] = useState(true);
    const [picks, setPicks] = useState<
        null | RandomPickResponse[] | RecommendationPickResponse[]
    >(null);
    const form = useForm<PickFormValues>({
        defaultValues: {
            userList: "",
        },
    });
    const { register, handleSubmit, watch } = form;

    const watchUserList = watch("userList");

    const getPicks = async (data: getPicksProps) => {
        setGettingPicks(true);
        setPicks(null);
        try {
            console.log(data);
            const response = await axios.post(
                `${backend}/api/get-watchlist-picks`,
                { data }
            );
            console.log(response.data);
            setPicks(response.data);
        } catch (error) {
            if (error instanceof AxiosError && error?.response?.status) {
                const errorMessage = new DOMParser()
                    .parseFromString(error.response.data, "text/html")
                    .querySelector("p")?.textContent;
                console.error(errorMessage);
                enqueueSnackbar(errorMessage, { variant: "error" });
            } else {
                console.error(error);
                enqueueSnackbar("Error", { variant: "error" });
            }
        }
        setGettingPicks(false);
    };

    const onSubmit = (formData: PickFormValues) => {
        const usernames = formData.userList
            .split(",")
            .map((user) => user.trim().toLowerCase())
            .filter((user) => user !== "");

        if (usernames.length === 0) {
            console.log("must enter valid username(s)");
            enqueueSnackbar("must enter valid username(s)", {
                variant: "error",
            });
            return;
        }
        const data = {
            ...formData,
            userList: formData.userList
                .split(",")
                .map((user) => user.trim().toLowerCase())
                .filter((user) => user !== ""),
            overlap: overlap === true ? "y" : "n",
            pickType: pickType,
            numPicks: 5,
        };

        if (data.userList.length === 0) {
            console.log("must enter valid username(s)");
            enqueueSnackbar("must enter valid username(s)", {
                variant: "error",
            });
            return;
        }

        getPicks(data);
    };

    const onError = (errors: FieldErrors<PickFormValues>) => {
        console.log("form errors", errors);
    };

    return (
        <div>
            <div className="w-fit mx-auto mt-8 flex flex-wrap space-x-4">
                <button
                    className={`w-40 mx-auto p-2 rounded-md ${
                        pickType === "random"
                            ? "shadow-md bg-palette-lightbrown"
                            : "bg-gray-200"
                    }`}
                    onClick={() => setPickType("random")}
                >
                    Random Movies
                </button>
                <button
                    className={`w-40 mx-auto p-2 rounded-md ${
                        pickType === "recommendation"
                            ? "shadow-md bg-palette-lightbrown"
                            : "bg-gray-200"
                    }`}
                    onClick={() => setPickType("recommendation")}
                >
                    Recommendations
                </button>
            </div>
            <PickInstructions pickType={pickType} />

            {!gettingPicks && (
                <form
                    className="w-fit mx-auto mt-8 flex flex-col space-y-4"
                    onSubmit={handleSubmit(onSubmit, onError)}
                    noValidate
                >
                    <label
                        className="text-center text-xl text-palette-darkbrown"
                        htmlFor="username"
                    >
                        Enter Letterboxd Username(s)
                    </label>
                    <div className="form-control flex flex-col align-center">
                        <input
                            className="w-64 sm:w-96 mx-auto p-1 text-center rounded-md bg-gray-200"
                            type="text"
                            placeholder="Separate by comma"
                            {...register("userList")}
                        />
                    </div>
                    {watchUserList.includes(",") && (
                        <CustomCheckbox
                            label="Only consider movies in common across watchlists"
                            labelPlacement="start"
                            checked={overlap}
                            setChecked={setOverlap}
                        />
                    )}

                    {watchUserList.trim() !== "" && !gettingPicks && (
                        <button className="block mx-auto p-2 rounded-md hover:shadow-md bg-gray-200 hover:bg-palette-lightbrown">
                            Get Watchlist Picks
                        </button>
                    )}
                </form>
            )}

            {gettingPicks && (
                <div className="w-fit mx-auto">
                    <p className="w-fit mx-auto my-8 sm:text-xl text-palette-darkbrown">
                        {watchUserList.split(",").length > 1
                            ? "Picking from watchlists..."
                            : "Picking from watchlist..."}
                    </p>
                    <LinearIndeterminate />
                </div>
            )}

            {!gettingPicks && picks && (
                <div className="w-fit max-w-5xl mx-auto mt-8 flex flex-wrap justify-around space-x-3">
                    {picks.map((pick) => (
                        <WatchlistCard key={pick.url} pick={pick} />
                    ))}
                </div>
            )}

            <LetterboxdAlert />
        </div>
    );
};

export default Picks;
