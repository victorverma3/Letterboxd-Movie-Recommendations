import { useState } from "react";
import axios, { AxiosError } from "axios";
import { useForm, FieldErrors, useFieldArray } from "react-hook-form";
import { useSnackbar } from "notistack";
import { AiOutlineMinusCircle, AiOutlinePlusCircle } from "react-icons/ai";

import Filters from "./Filters";
import RecTable from "./RecTable";

const backend = import.meta.env.VITE_BACKEND_URL;

type FormValues = {
    userList: { user: string }[];
};

type Query = {
    usernames: string[];
    popularity: number;
    release_year: number;
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
    if (previousQuery.release_year !== currentQuery.release_year) return false;
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

type Option = {
    label: string;
    value: string;
    disabled?: boolean;
};

type Runtime = {
    value: number;
    label: string;
};

const Recommendation = () => {
    const { enqueueSnackbar } = useSnackbar();

    const [isSingleQuery, setIsSingleQuery] = useState(true);

    const [previousQuery, setPreviousQuery] = useState<Query>({
        usernames: [],
        popularity: -1,
        release_year: -1,
        genres: [],
        runtime: -2,
    });

    const [recommendations, setRecommendations] = useState<
        null | RecommendationResponse[]
    >(null);
    const [gettingRecs, setGettingRecs] = useState(false);

    const getRecommendations = async (usernames: string[]) => {
        if (genres.length === 0) {
            console.log("Genre must be selected");
            enqueueSnackbar("Genre must be selected", { variant: "error" });
            return;
        }
        const currentQuery = {
            usernames: usernames,
            popularity: popularity,
            release_year: releaseYear,
            genres: genres.map((genre) => genre.value).sort(),
            runtime: runtime.value,
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

    const [popularity, setPopularity] = useState<number>(3);
    const [releaseYear, setReleaseYear] = useState(1920);
    const [genres, setGenres] = useState<Option[]>([
        { label: "Action", value: "action" },
        { label: "Adventure", value: "adventure" },
        { label: "Animation", value: "animation" },
        { label: "Comedy", value: "comedy" },
        { label: "Crime", value: "crime" },
        { label: "Drama", value: "drama" },
        { label: "Family", value: "family" },
        { label: "Fantasy", value: "fantasy" },
        { label: "History", value: "history" },
        { label: "Horror", value: "horror" },
        { label: "Mystery", value: "mystery" },
        { label: "Romance", value: "romance" },
        {
            label: "Science Fiction",
            value: "science_fiction",
        },
        { label: "TV Movie", value: "tv_movie" },
        { label: "Thriller", value: "thriller" },
        { label: "War", value: "war" },
        { label: "Western", value: "western" },
    ]);
    const [runtime, setRuntime] = useState<Runtime>({
        value: -1,
        label: "Any",
    });

    return (
        <div>
            <Filters
                popularity={popularity}
                setPopularity={setPopularity}
                releaseYear={releaseYear}
                setReleaseYear={setReleaseYear}
                genres={genres}
                setGenres={setGenres}
                runtime={runtime}
                setRuntime={setRuntime}
            />{" "}
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
                <p className="w-fit mx-auto mt-8 text-l sm:text-xl text-amber-800">
                    generating recommendations...
                </p>
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
