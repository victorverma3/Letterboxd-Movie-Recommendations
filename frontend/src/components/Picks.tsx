import { useState } from "react";
import axios from "axios";
import { FieldErrors, useForm } from "react-hook-form";
import { useSnackbar } from "notistack";

import CarouselRecDisplay from "./Displays/CarouselRecDisplay";
import CustomCheckbox from "./Selection/CustomCheckbox";
import LinearIndeterminate from "./LinearIndeterminate";
import PickInstructions from "./Modals/PickInstructions";
import RecDisplay from "./Displays/RecDisplay";

import useIsScreenMd from "../hooks/useIsScreenMd";

import {
    PickFormValues,
    PickType,
    PickRandomResponse,
    PickRecommendationResponse,
    PickQuery,
} from "../types/WatchlistTypes";

const backend = import.meta.env.VITE_BACKEND_URL;

const isQueryEqual = (
    previousQuery: PickQuery,
    currentQuery: PickQuery
): boolean => {
    if (currentQuery.pick_type === "random") return false;
    if (
        previousQuery.usernames.slice().sort().toString() !==
        currentQuery.usernames.slice().sort().toString()
    )
        return false;
    if (previousQuery.overlap != currentQuery.overlap) return false;
    if (previousQuery.pick_type != currentQuery.pick_type) return false;

    return true;
};

interface getPicksProps {
    userList: string[];
    overlap: "y" | "n";
    pickType: PickType;
}

const Picks = () => {
    const isScreenMd = useIsScreenMd();
    const { enqueueSnackbar } = useSnackbar();
    const [gettingPicks, setGettingPicks] = useState(false);
    const [pickType, setPickType] = useState<PickType>("random");
    const [overlap, setOverlap] = useState<boolean>(true);

    const [previousQuery, setPreviousQuery] = useState<PickQuery>({
        usernames: [],
        overlap: "y",
        pick_type: "random",
    });

    const [picks, setPicks] = useState<
        null | PickRandomResponse[] | PickRecommendationResponse[]
    >(null);
    const form = useForm<PickFormValues>({
        defaultValues: {
            userList: "",
        },
    });
    const { register, handleSubmit, watch } = form;

    const watchUserList = watch("userList");

    const getPicks = async (data: getPicksProps) => {
        const currentQuery = {
            usernames: data.userList,
            overlap: data.overlap,
            pick_type: data.pickType,
        };

        if (!isQueryEqual(previousQuery, currentQuery)) {
            setGettingPicks(true);
            setPicks(null);
            try {
                // console.log(data);
                const response = await axios.post(
                    `${backend}/api/get-watchlist-picks`,
                    { data }
                );
                // console.log(response.data.data);
                setPicks(response.data.data);
                setPreviousQuery(currentQuery);
            } catch (error: unknown) {
                if (
                    axios.isAxiosError(error) &&
                    error.response?.data?.message
                ) {
                    console.error(error.response.data.message);
                    enqueueSnackbar(error.response.data.message, {
                        variant: "error",
                    });
                } else {
                    console.error(error);
                    enqueueSnackbar("Internal server error", {
                        variant: "error",
                    });
                }
            }
        } else {
            enqueueSnackbar("Identical user query", {
                variant: "info",
            });
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
        const data: getPicksProps = {
            ...formData,
            userList: formData.userList
                .split(",")
                .map((user) => user.trim().toLowerCase())
                .filter((user) => user !== ""),
            overlap: overlap === true ? "y" : "n",
            pickType: pickType,
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
        <div className="lg:w-[700px] mx-auto">
            <div className="w-fit mx-auto mt-8 flex flex-wrap space-x-4">
                <button
                    className={`w-40 mx-auto p-2 rounded-md hover:shadow-md ${
                        pickType === "random"
                            ? "shadow-md bg-palette-lightbrown"
                            : "bg-gray-200"
                    }`}
                    onClick={() => setPickType("random")}
                >
                    Random Movies
                </button>
                <button
                    className={`w-40 mx-auto p-2 rounded-md hover:shadow-md ${
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
                        <div className="mx-auto">
                            <CustomCheckbox
                                label="Only consider overlap"
                                labelPlacement="start"
                                checked={overlap}
                                setChecked={setOverlap}
                            />
                        </div>
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

            {!gettingPicks &&
                picks &&
                (isScreenMd ? (
                    <CarouselRecDisplay recommendations={picks} />
                ) : (
                    <RecDisplay recommendations={picks} />
                ))}
        </div>
    );
};

export default Picks;
