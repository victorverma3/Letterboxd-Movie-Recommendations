import { useContext, useState } from "react";
import axios, { AxiosError } from "axios";
import { FieldErrors, useForm } from "react-hook-form";
import { useSnackbar } from "notistack";

import ExportRecs from "./Exports/ExportRecs";
import Filters from "./Filters";
import LetterboxdAlert from "./Alerts/LetterboxdAlert";
import LinearIndeterminate from "./LinearIndeterminate";
import RecDisplay from "./RecDisplay";

import {
    RecommendationFormValues,
    RecommendationResponse,
    RecommendationQuery,
} from "../types/RecommendationsTypes";

import { MovieFilterContext } from "../contexts/MovieFilterContext";

const backend = import.meta.env.VITE_BACKEND_URL;

const isQueryEqual = (
    previousQuery: RecommendationQuery,
    currentQuery: RecommendationQuery
): boolean => {
    if (
        previousQuery.usernames.slice().sort().toString() !==
        currentQuery.usernames.slice().sort().toString()
    )
        return false;
    if (previousQuery.genres !== currentQuery.genres) return false;
    if (previousQuery.content_types !== currentQuery.content_types)
        return false;
    if (previousQuery.min_release_year !== currentQuery.min_release_year)
        return false;
    if (previousQuery.max_release_year !== currentQuery.max_release_year)
        return false;
    for (let i = 0; i < previousQuery.genres.length; i++) {
        if (previousQuery.genres[i] !== currentQuery.genres[i]) return false;
    }
    if (previousQuery.min_runtime !== currentQuery.min_runtime) return false;
    if (previousQuery.max_runtime !== currentQuery.max_runtime) return false;
    if (previousQuery.popularity !== currentQuery.popularity) return false;
    if (previousQuery.model_type !== currentQuery.model_type) return false;

    return true;
};

const Recommendation = () => {
    const context = useContext(MovieFilterContext);
    if (!context) {
        throw new Error(
            "Movie filters must be used within a MovieFilterProvider"
        );
    }
    const [state] = context;

    const { enqueueSnackbar } = useSnackbar();

    const [previousQuery, setPreviousQuery] = useState<RecommendationQuery>({
        usernames: [],
        genres: [],
        content_types: [],
        min_release_year: -1,
        max_release_year: -1,
        min_runtime: -1,
        max_runtime: -1,
        popularity: -1,
        model_type: "",
    });

    const [recommendations, setRecommendations] = useState<
        null | RecommendationResponse[]
    >(null);
    const [gettingRecs, setGettingRecs] = useState(false);

    const getRecommendations = async (usernames: string[]) => {
        // validates genres filter
        if (state.genres.length === 0) {
            console.log("Genre must be selected");
            enqueueSnackbar("Genre must be selected", { variant: "error" });
            return;
        }

        // validates content types filter
        if (state.contentTypes.length === 0) {
            console.log("Content type must be selected");
            enqueueSnackbar("Content type must be selected", {
                variant: "error",
            });
            return;
        }

        // validates release year filter
        if (
            isNaN(Number(state.minReleaseYear)) ||
            state.minReleaseYear.trim() === "" ||
            isNaN(Number(state.maxReleaseYear)) ||
            state.maxReleaseYear.trim() === ""
        ) {
            console.log("Min and max release year must be numbers");
            enqueueSnackbar("Min and max release year must be numbers", {
                variant: "error",
            });
            return;
        } else if (
            Number(state.minReleaseYear) > new Date().getFullYear() ||
            Number(state.maxReleaseYear) > new Date().getFullYear() ||
            Number(state.minReleaseYear) < 1880 ||
            Number(state.maxReleaseYear) < 1880
        ) {
            console.log(
                `Min and max release year must be between 1880 and ${new Date().getFullYear()} (inclusive)`
            );
            enqueueSnackbar(
                `Min and max release year must be between 1880 and ${new Date().getFullYear()} (inclusive)`,
                { variant: "error" }
            );
            return;
        } else if (state.minReleaseYear > state.maxReleaseYear) {
            console.log(
                "Min release year cannot be after the max release year"
            );
            enqueueSnackbar(
                "Min release year cannot be after the max release year",
                { variant: "error" }
            );
            return;
        }

        // validates runtime filter
        if (
            isNaN(Number(state.minRuntime)) ||
            state.minRuntime.trim() === "" ||
            isNaN(Number(state.maxRuntime)) ||
            state.maxRuntime.trim() === ""
        ) {
            console.log("Min and max runtime must be numbers");
            enqueueSnackbar("Min and max runtime must be numbers", {
                variant: "error",
            });
            return;
        } else if (
            Number(state.minRuntime) > 2000 ||
            Number(state.minRuntime) < 0
        ) {
            console.log(`Min runtime must be between 0 and 2000 (inclusive)`);
            enqueueSnackbar(
                `Min runtime must be between 0 and 2000 (inclusive)`,
                { variant: "error" }
            );
            return;
        } else if (
            Number(state.maxRuntime) > 2000 ||
            Number(state.maxRuntime) < 5
        ) {
            console.log(`Max runtime must be between 5 and 2000 (inclusive)`);
            enqueueSnackbar(
                `Max runtime must be between 5 and 2000 (inclusive)`,
                { variant: "error" }
            );
            return;
        } else if (Number(state.minRuntime) > Number(state.maxRuntime)) {
            console.log("Min runtime cannot be greater than the max runtime");
            console.log(state.minRuntime, state.maxRuntime);
            enqueueSnackbar(
                "Min runtime cannot be greater than the max runtime",
                {
                    variant: "error",
                }
            );
            return;
        }

        const currentQuery = {
            usernames: usernames,
            genres: state.genres.map((genre) => genre.value).sort(),
            content_types: state.contentTypes.map(
                (contentType) => contentType.value
            ),
            min_release_year: Number(state.minReleaseYear),
            max_release_year: Number(state.maxReleaseYear),
            min_runtime: Number(state.minRuntime),
            max_runtime: Number(state.maxRuntime),
            popularity: state.popularity,
            model_type: state.modelType.value,
        };
        if (!isQueryEqual(previousQuery, currentQuery)) {
            setGettingRecs(true);
            setRecommendations(null);
            try {
                console.log(currentQuery);
                const response = await axios.post(
                    `${backend}/api/get-recommendations`,
                    { currentQuery }
                );
                console.log(response.data);
                setRecommendations(response.data);
                setPreviousQuery(currentQuery);
                setGeneratedDatetime(new Date().toLocaleString());
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
        } else {
            console.log("using cached response");
            enqueueSnackbar("Identical user query - using previous response", {
                variant: "info",
            });
        }
        setGettingRecs(false);
    };

    const form = useForm<RecommendationFormValues>({
        defaultValues: {
            userList: "",
        },
    });
    const { register, handleSubmit, watch } = form;
    const watchUserList = watch("userList");

    const onSubmit = (formData: RecommendationFormValues) => {
        const usernames = formData.userList
            .split(",")
            .map((user) => user.trim().toLowerCase())
            .filter((user) => user !== "");

        if (usernames.length === 0) {
            console.log("must enter valid username(s)");
            enqueueSnackbar("Must enter valid username(s)", {
                variant: "error",
            });
            return;
        }

        getRecommendations(usernames);
    };

    const onError = (errors: FieldErrors<RecommendationFormValues>) => {
        console.log("form errors", errors);
    };

    const [generatedDatetime, setGeneratedDatetime] = useState<string>("");

    return (
        <div>
            <Filters />

            {!gettingRecs && (
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

                    {watchUserList.trim() !== "" && (
                        <button className="block mx-auto p-2 rounded-md hover:shadow-md bg-gray-200 hover:bg-palette-lightbrown">
                            Get Recommendations
                        </button>
                    )}
                </form>
            )}

            {gettingRecs && (
                <div className="w-fit mx-auto">
                    <p className="mx-auto my-8 sm:text-xl text-palette-darkbrown">
                        Generating recommendations...
                    </p>
                    <LinearIndeterminate />
                </div>
            )}

            {!gettingRecs && recommendations && (
                <ExportRecs
                    recommendations={recommendations}
                    userList={watchUserList}
                    generatedDatetime={generatedDatetime}
                />
            )}

            {!gettingRecs && recommendations && (
                <RecDisplay recommendations={recommendations} />
            )}

            <LetterboxdAlert />
        </div>
    );
};

export default Recommendation;
