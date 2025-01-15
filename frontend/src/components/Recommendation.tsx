import { useState, useContext } from "react";
import axios, { AxiosError } from "axios";
import { useForm, FieldErrors } from "react-hook-form";
import { useSnackbar } from "notistack";

import Filters from "./Filters";
import LinearIndeterminate from "./LinearIndeterminate";
import RecDisplay from "./RecDisplay";

import { MovieFilterContext } from "../contexts/MovieFilterContext";

const backend = import.meta.env.VITE_BACKEND_URL;

type FormValues = {
    userList: string;
};

type Query = {
    usernames: string[];
    popularity: number;
    start_release_year: number;
    end_release_year: number;
    genres: string[];
    runtime: number;
};

const isQueryEqual = (previousQuery: Query, currentQuery: Query): boolean => {
    if (
        previousQuery.usernames.slice().sort().toString() !==
        currentQuery.usernames.slice().sort().toString()
    )
        return false;

    if (previousQuery.popularity !== currentQuery.popularity) return false;
    if (previousQuery.start_release_year !== currentQuery.start_release_year)
        return false;
    if (previousQuery.end_release_year !== currentQuery.end_release_year)
        return false;
    if (previousQuery.runtime !== currentQuery.runtime) return false;

    if (previousQuery.genres.length !== currentQuery.genres.length)
        return false;
    for (let i = 0; i < previousQuery.genres.length; i++) {
        if (previousQuery.genres[i] !== currentQuery.genres[i]) return false;
    }

    return true;
};

type RecommendationResponse = {
    title: string;
    poster: string;
    release_year: number;
    predicted_rating: number;
    url: string;
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

    const [previousQuery, setPreviousQuery] = useState<Query>({
        usernames: [],
        popularity: -1,
        start_release_year: -1,
        end_release_year: -1,
        genres: [],
        runtime: -2,
    });

    const [recommendations, setRecommendations] = useState<
        null | RecommendationResponse[]
    >(null);
    const [gettingRecs, setGettingRecs] = useState(false);

    const getRecommendations = async (usernames: string[]) => {
        // validates release year filter
        if (
            isNaN(Number(state.startReleaseYear)) ||
            state.startReleaseYear.trim() === "" ||
            isNaN(Number(state.endReleaseYear)) ||
            state.endReleaseYear.trim() === ""
        ) {
            console.log("Start and end release year must be numbers");
            enqueueSnackbar("Start and end release year must be numbers", {
                variant: "error",
            });
            return;
        } else if (
            Number(state.startReleaseYear) > new Date().getFullYear() ||
            Number(state.endReleaseYear) > new Date().getFullYear() ||
            Number(state.startReleaseYear) < 1880 ||
            Number(state.endReleaseYear) < 1880
        ) {
            console.log(
                `Start and end release year must be between 1880 and ${new Date().getFullYear()} (inclusive)`
            );
            enqueueSnackbar(
                `Start and end release year must be between 1880 and ${new Date().getFullYear()} (inclusive)`,
                { variant: "error" }
            );
            return;
        } else if (state.startReleaseYear > state.endReleaseYear) {
            console.log(
                "Start release year cannot be after the end release year"
            );
            enqueueSnackbar(
                "Start release year cannot be after the end release year",
                { variant: "error" }
            );
            return;
        }
        // validates genres filter
        if (state.genres.length === 0) {
            console.log("Genre must be selected");
            enqueueSnackbar("Genre must be selected", { variant: "error" });
            return;
        }
        const currentQuery = {
            usernames: usernames,
            popularity: state.popularity,
            start_release_year: Number(state.startReleaseYear),
            end_release_year: Number(state.endReleaseYear),
            genres: state.genres.map((genre) => genre.value).sort(),
            runtime: state.runtime.value,
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
            enqueueSnackbar("Identical user query - using cached response", {
                variant: "info",
            });
        }
        setGettingRecs(false);
    };

    const form = useForm<FormValues>({
        defaultValues: {
            userList: "",
        },
    });
    const { register, handleSubmit, watch } = form;
    const watchUserList = watch("userList");

    const onSubmit = (formData: FormValues) => {
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

    const onError = (errors: FieldErrors<FormValues>) => {
        console.log("form errors", errors);
    };

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
                <div className="w-fit mx-auto mt-8">
                    <RecDisplay recommendations={recommendations}></RecDisplay>
                </div>
            )}
        </div>
    );
};

export default Recommendation;
