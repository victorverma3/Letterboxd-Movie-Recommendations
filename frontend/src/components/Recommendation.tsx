import { useState } from "react";
import axios, { AxiosError } from "axios";
import { useForm, FieldErrors } from "react-hook-form";
import { useSnackbar } from "notistack";

import Filters from "./Filters";
import RecTable from "./RecTable";

const backend = import.meta.env.VITE_BACKEND_URL;

type FormValues = {
    username: string;
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
    const [recommendations, setRecommendations] = useState<
        null | RecommendationResponse[]
    >(null);
    const [gettingRecs, setGettingRecs] = useState(false);

    const getRecommendations = async (username: string) => {
        setGettingRecs(true);
        setRecommendations(null);
        try {
            const data = {
                username: username,
                popularity: popularity,
                release_year: releaseYear,
                genres: genres.map((genre) => genre.value),
                runtime: runtime.value,
            };
            console.log(data);
            const response = await axios.post(
                `${backend}/api/get-recommendations`,
                { data }
            );
            console.log(response.data);
            setRecommendations(response.data);
        } catch (error) {
            if (
                error instanceof AxiosError &&
                error?.response?.status === 400
            ) {
                const errorMessage = new DOMParser()
                    .parseFromString(error.response.data, "text/html")
                    .querySelector("p")?.textContent;
                console.error(errorMessage);
                enqueueSnackbar(errorMessage, { variant: "error" });
            } else {
                console.error(error);
            }
        }
        setGettingRecs(false);
    };

    const form = useForm<FormValues>({
        defaultValues: {
            username: "",
        },
    });
    const { register, handleSubmit, formState } = form;
    const { errors, isDirty, isValid } = formState;

    const onSubmit = (data: FormValues) => {
        const username = data.username.toLowerCase();
        getRecommendations(username);
    };

    const onError = (errors: FieldErrors<FormValues>) => {
        console.log("form errors", errors);
    };

    const [popularity, setPopularity] = useState<number>(2);
    const [releaseYear, setReleaseYear] = useState(1940);
    const [genres, setGenres] = useState<Option[]>([
        { label: "Action", value: "is_action" },
        { label: "Adventure", value: "is_adventure" },
        { label: "Animation", value: "is_animation" },
        { label: "Comedy", value: "is_comedy" },
        { label: "Crime", value: "is_crime" },
        { label: "Documentary", value: "is_documentary" },
        { label: "Drama", value: "is_drama" },
        { label: "Family", value: "is_family" },
        { label: "Fantasy", value: "is_fantasy" },
        { label: "History", value: "is_history" },
        { label: "Horror", value: "is_horror" },
        { label: "Music", value: "is_music" },
        { label: "Mystery", value: "is_mystery" },
        { label: "Romance", value: "is_romance" },
        {
            label: "Science Fiction",
            value: "is_science_fiction",
        },
        { label: "TV Movie", value: "is_tv_movie" },
        { label: "Thriller", value: "is_thriller" },
        { label: "War", value: "is_war" },
        { label: "Western", value: "is_western" },
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
                    className="w-fit mx-auto mt-16 sm:mt-24"
                    onSubmit={handleSubmit(onSubmit, onError)}
                    noValidate
                >
                    <div className="form-control flex flex-col">
                        <label
                            className="text-center text-xl"
                            htmlFor="username"
                        >
                            Enter Letterboxd Username
                        </label>
                        <input
                            className="w-64 sm:w-96 mx-auto mt-4 text-center border-2 border-solid border-black"
                            type="text"
                            id="username"
                            {...register("username", {
                                required: {
                                    value: true,
                                    message: "Username is required",
                                },
                                validate: {
                                    notEmpty: (fieldValue) => {
                                        return (
                                            fieldValue !== "" ||
                                            "username cannot be empty"
                                        );
                                    },
                                    notDefault: (fieldValue) => {
                                        return (
                                            fieldValue !==
                                                "Enter Letterboxd Username" ||
                                            "must enter username"
                                        );
                                    },
                                },
                            })}
                        />
                        <p className="mx-auto mt-2 text-red-500">
                            {errors.username?.message}
                        </p>
                    </div>

                    {isDirty && isValid && !gettingRecs && (
                        <button className="mx-auto mt-4 p-2 block text-xl border-2 rounded-md hover:border-amber-800 hover:shadow-md transition duration-200">
                            Get Recommendations
                        </button>
                    )}
                </form>
            )}
            {gettingRecs && (
                <p className="w-fit mx-auto mt-8 text-l sm:text-xl">
                    generating recommendations...
                </p>
            )}
            {!gettingRecs && recommendations && (
                <div className="w-fit mx-auto mt-8">
                    <RecTable recommendations={recommendations} />
                </div>
            )}
        </div>
    );
};

export default Recommendation;
