import { useState, useContext } from "react";
import axios, { AxiosError } from "axios";
import { useForm, FieldErrors, useFieldArray } from "react-hook-form";
import { useSnackbar } from "notistack";
import { AiOutlineMinusCircle, AiOutlinePlusCircle } from "react-icons/ai";

import Filters from "./Filters";
import LinearIndeterminate from "./LinearIndeterminate";
import RecTable from "./RecTable";

import { MovieFilterContext } from "../contexts/MovieFilterContext";

const backend = import.meta.env.VITE_BACKEND_URL;

type FormValues = {
    userList: { user: string }[];
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

    const [isSingleQuery, setIsSingleQuery] = useState(true);

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
            enqueueSnackbar("identical user query - using cached response", {
                variant: "info",
            });
        }
        setGettingRecs(false);
    };

    const form = useForm<FormValues>({
        defaultValues: {
            userList: [{ user: "" }],
        },
    });
    const { register, control, handleSubmit, watch } = form;
    const { fields, append, remove } = useFieldArray({
        name: "userList",
        control,
    });

    const userList = watch("userList");

    const onSubmit = (formData: FormValues) => {
        const usernames = formData.userList
            .map((item) => item.user.trim().toLowerCase())
            .filter((user) => user !== "");

        if (usernames.length === 1) {
            setIsSingleQuery(true);
        } else {
            setIsSingleQuery(false);
        }

        getRecommendations(usernames);
    };

    const onError = (errors: FieldErrors<FormValues>) => {
        console.log("form errors", errors);
    };

    const isUserListValid = userList.some((item) => item.user.trim() !== "");

    return (
        <div>
            <Filters />{" "}
            {!gettingRecs && (
                <form
                    className="w-fit mx-auto mt-4"
                    onSubmit={handleSubmit(onSubmit, onError)}
                    noValidate
                >
                    <div className="w-fit mx-auto my-4 flex flex-col">
                        <label
                            className="text-center text-xl"
                            htmlFor="username"
                        >
                            Enter Letterboxd Username(s)
                        </label>
                        <div>
                            {fields.map((field, index) => {
                                return (
                                    <div
                                        className="form-control flex flex-col align-center"
                                        key={field.id}
                                    >
                                        <input
                                            className="w-64 sm:w-96 mx-auto mt-4 text-center border-2 border-solid border-black"
                                            type="text"
                                            {...register(
                                                `userList.${index}.user` as const
                                            )}
                                        />
                                        {index > 0 && (
                                            <button
                                                className="block mx-auto my-2"
                                                type="button"
                                                onClick={() => remove(index)}
                                            >
                                                <AiOutlineMinusCircle
                                                    size={24}
                                                />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                            <button
                                className="block mx-auto my-2"
                                type="button"
                                onClick={() => append({ user: "" })}
                            >
                                <AiOutlinePlusCircle size={24} />
                            </button>
                        </div>
                    </div>

                    {isUserListValid && !gettingRecs && (
                        <button className="mx-auto my-4 p-2 block text-xl border-2 rounded-md hover:border-amber-800 hover:shadow-md transition duration-200">
                            Get Recommendations
                        </button>
                    )}
                </form>
            )}
            {gettingRecs && (
                <div className="w-fit mx-auto">
                    <p className="mx-auto my-8 text-l sm:text-xl text-amber-800">
                        Generating recommendations...
                    </p>
                    <LinearIndeterminate />
                </div>
            )}
            {!gettingRecs && recommendations && (
                <div className="w-fit mx-auto mt-8">
                    <RecTable
                        recommendations={recommendations}
                        variant={isSingleQuery ? "single" : "multiple"}
                    />
                </div>
            )}
        </div>
    );
};

export default Recommendation;
