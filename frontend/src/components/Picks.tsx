import { useContext, useState } from "react";
import axios from "axios";
import { FieldErrors, useForm } from "react-hook-form";
import { enqueueSnackbar } from "notistack";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import Tooltip from "@mui/material/Tooltip";

import CarouselRecDisplay from "./Displays/CarouselRecDisplay";
import CustomCheckbox from "./Selection/CustomCheckbox";
import ExportLetterboxdCSV from "./Exports/ExportLetterboxdCSV";
import ExportRecs from "./Exports/ExportRecs";
import LinearIndeterminate from "./LinearIndeterminate";
import PickInstructions from "./Modals/PickInstructions";
import RecDisplay from "./Displays/RecDisplay";

import useIsScreenXl from "../hooks/useIsScreenXl";

import {
    PickFormValues,
    PickState,
    PickType,
    PickQuery,
} from "../types/WatchlistTypes";

import { CardViewContext } from "../contexts/CardViewContext";

const backend = import.meta.env.VITE_BACKEND_URL;

const isQueryEqual = (
    previousQuery: PickQuery,
    currentQuery: PickQuery
): boolean => {
    if (currentQuery.pickType === "random") return false;
    if (
        previousQuery.usernames.slice().sort().toString() !==
        currentQuery.usernames.slice().sort().toString()
    )
        return false;
    if (previousQuery.overlap != currentQuery.overlap) return false;
    if (previousQuery.pickType != currentQuery.pickType) return false;

    return true;
};

interface getPicksProps {
    userList: string[];
    overlap: "y" | "n";
    pickType: PickType;
}

const Picks = () => {
    const isScreenXl = useIsScreenXl();

    const cardViewContext = useContext(CardViewContext);
    if (!cardViewContext) {
        throw new Error(
            "Recommendations must be used within a CardViewProvider"
        );
    }
    const [cardViewState, cardViewDispatch] = cardViewContext;

    const [generatedDatetime, setGeneratedDatetime] = useState<string>("");

    const [gettingPicks, setGettingPicks] = useState(false);
    const [overlap, setOverlap] = useState<boolean>(true);

    const [previousQuery, setPreviousQuery] = useState<PickQuery>({
        usernames: [],
        overlap: "y",
        pickType: "random",
    });

    const [pickState, setPickState] = useState<PickState>({
        type: "random",
        data: null,
    });

    const form = useForm<PickFormValues>({
        defaultValues: {
            userList: "",
        },
    });
    const { register, handleSubmit, watch } = form;

    const watchUserList = watch("userList");

    const getPicks = async (data: getPicksProps) => {
        const currentQuery = {
            usernames: data.userList.map((username) =>
                username.replace("https://letterboxd.com/", "").replace("/", "")
            ),
            overlap: data.overlap,
            pickType: data.pickType,
        };

        if (!isQueryEqual(previousQuery, currentQuery)) {
            setGettingPicks(true);
            setPickState((prev) => ({
                ...prev,
                data: null,
            }));

            try {
                // console.log(currentQuery);
                const response = await axios.post(
                    `${backend}/api/get-watchlist-picks`,
                    { currentQuery }
                );
                // console.log(response.data.data);
                setPickState((prev) => ({
                    ...prev,
                    data: response.data.data,
                }));
                setPreviousQuery(currentQuery);
                setGeneratedDatetime(new Date().toLocaleString());
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
            pickType: pickState.type,
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
                        pickState.type === "random"
                            ? "shadow-md bg-palette-lightbrown"
                            : "bg-gray-200"
                    }`}
                    onClick={() => {
                        setPickState({ type: "random", data: null });
                    }}
                >
                    Random Movies
                </button>
                <button
                    className={`w-40 mx-auto p-2 rounded-md hover:shadow-md ${
                        pickState.type === "recommendation"
                            ? "shadow-md bg-palette-lightbrown"
                            : "bg-gray-200"
                    }`}
                    onClick={() => {
                        setPickState({ type: "recommendation", data: null });
                    }}
                >
                    Recommendations
                </button>
            </div>
            <PickInstructions pickType={pickState.type} />

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

            {!gettingPicks && pickState.data?.length && (
                <>
                    {isScreenXl ? (
                        <div
                            className={`mt-4 rounded-lg ${
                                cardViewState.view === "carousel" &&
                                "shadow shadow-palette-darkbrown"
                            }`}
                        >
                            <div
                                className={`p-1 flex justify-between ${
                                    cardViewState.view === "grid" &&
                                    "border-t-2 border-x-2 border-gray-200"
                                } rounded-t-lg bg-palette-lightbrown`}
                            >
                                <div className="flex gap-0.5">
                                    <ExportLetterboxdCSV
                                        data={pickState.data}
                                        filename={`${
                                            pickState.type === "random"
                                                ? "letterboxd_watchlist_picks_random.csv"
                                                : "letterboxd_watchlist_picks_recommendations.csv"
                                        }`}
                                    />
                                    {pickState.type === "recommendation" && (
                                        <ExportRecs
                                            recommendations={pickState.data}
                                            userList={watchUserList}
                                            generatedDatetime={
                                                generatedDatetime
                                            }
                                            filename="letterboxd_watchlist_picks_recommendations.png"
                                            title="Letterboxd Watchlist Recommendations"
                                        />
                                    )}
                                </div>
                                <div className="flex gap-0.5">
                                    <Tooltip title="Grid">
                                        <ViewModuleIcon
                                            className={`${
                                                cardViewState.view === "grid"
                                                    ? "text-palette-darkbrown"
                                                    : "text-gray-200"
                                            } hover:cursor-pointer`}
                                            onClick={() =>
                                                cardViewDispatch({
                                                    type: "setView",
                                                    payload: {
                                                        view: "grid",
                                                    },
                                                })
                                            }
                                        />
                                    </Tooltip>
                                    <Tooltip title="Carousel">
                                        <ViewColumnIcon
                                            className={`${
                                                cardViewState.view ===
                                                "carousel"
                                                    ? "text-palette-darkbrown"
                                                    : "text-gray-200"
                                            } hover:cursor-pointer`}
                                            onClick={() =>
                                                cardViewDispatch({
                                                    type: "setView",
                                                    payload: {
                                                        view: "carousel",
                                                    },
                                                })
                                            }
                                        />
                                    </Tooltip>
                                </div>
                            </div>
                            {cardViewState.view === "carousel" ? (
                                <CarouselRecDisplay
                                    recommendations={pickState.data}
                                />
                            ) : (
                                <RecDisplay recommendations={pickState.data} />
                            )}
                        </div>
                    ) : (
                        <div className="mt-4 rounded-lg">
                            <div className="max-w-4/5 md:max-w-[700px] sm:w-full mx-auto p-1 flex justify-start gap-0.5 border-t-2 border-x-2 border-gray-200 rounded-t-lg bg-palette-lightbrown">
                                <ExportLetterboxdCSV
                                    data={pickState.data}
                                    filename={`${
                                        pickState.type === "random"
                                            ? "letterboxd_watchlist_picks_random.csv"
                                            : "letterboxd_watchlist_picks_recommendations.csv"
                                    }`}
                                />
                                {pickState.type === "recommendation" && (
                                    <ExportRecs
                                        recommendations={pickState.data}
                                        userList={watchUserList}
                                        generatedDatetime={generatedDatetime}
                                        filename="letterboxd_watchlist_picks_recommendations.png"
                                        title="Letterboxd Watchlist Recommendations"
                                    />
                                )}
                            </div>
                            <RecDisplay recommendations={pickState.data} />
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Picks;
