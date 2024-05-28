import { useState } from "react";
import axios, { AxiosError } from "axios";
import { useForm, FieldErrors } from "react-hook-form";
import { useSnackbar } from "notistack";

import CategoryDefinitions from "../components/CategoryDefinitions";
import Maintenance from "../components/Maintenance";
import PercentilesDisplay from "../components/PercentilesDisplay";
import StatsTable from "../components/StatsTable";

const backend = import.meta.env.VITE_BACKEND_URL;

type FormValues = {
    username: string;
};

type StatisticsResponse = {
    letterboxd_rating: {
        mean: number;
        std: number;
    };
    letterboxd_rating_count: {
        mean: number;
    };
    rating_differential: {
        mean: number;
        std: number;
    };
    user_rating: {
        mean: number;
        std: number;
    };
};

type PercentilesResponse = {
    user_rating_percentile: number;
    letterboxd_rating_percentile: number;
    rating_differential_percentile: number;
    letterboxd_rating_count_percentile: number;
};

const Statistics = () => {
    const { enqueueSnackbar } = useSnackbar();
    const [currentUser, setCurrentUser] = useState("");
    const [statistics, setStatistics] = useState<null | StatisticsResponse>(
        null
    );
    const [distribution, setDistribution] = useState("");
    const [percentiles, setPercentiles] = useState<null | PercentilesResponse>(
        null
    );
    const [gettingStats, setGettingStats] = useState(false);

    const getStatistics = async (username: string) => {
        setGettingStats(true);
        console.log(username);
        if (username !== currentUser) {
            setStatistics(null);
            setDistribution("");
            try {
                const dataframeResponse = await axios.post(
                    `${backend}/api/get-dataframe`,
                    { username: username }
                );
                console.log(dataframeResponse.data);

                const statisticsResponse = await axios.post(
                    `${backend}/api/get-statistics`,
                    { username: username, dataframe: dataframeResponse.data }
                );
                console.log(statisticsResponse.data);
                setStatistics(statisticsResponse.data);

                const distributionResponse = await axios.post(
                    `${backend}/api/get-rating-distribution`,
                    { username: username, dataframe: dataframeResponse.data },
                    { responseType: "arraybuffer" }
                );
                console.log("got distribution image");
                const blob = new Blob([distributionResponse.data], {
                    type: "image/png",
                });
                const imageURL = URL.createObjectURL(blob);
                setDistribution(imageURL);

                const percentilesResponse = await axios.post(
                    `${backend}/api/get-percentiles`,
                    { user_stats: statisticsResponse.data }
                );
                console.log(percentilesResponse.data);
                setPercentiles(percentilesResponse.data);
                setCurrentUser(username);
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
        } else {
            console.log("using cached data");
        }
        setGettingStats(false);
    };

    const form = useForm<FormValues>({
        defaultValues: {
            username: "",
        },
    });
    const { register, handleSubmit, formState, getValues } = form;
    const { errors, isDirty, isValid } = formState;

    const onSubmit = (data: FormValues) => {
        const username = data.username.toLowerCase();
        getStatistics(username);
    };

    const onError = (errors: FieldErrors<FormValues>) => {
        console.log("form errors", errors);
    };

    return (
        <div>
            <h1 className="w-96 max-w-full mx-auto mt-16 text-center text-4xl">
                Letterboxd User Statistics
            </h1>
            {false && (
                <div className="w-96 max-w-full mx-auto my-8">
                    <Maintenance
                        severity="warning"
                        message="The site is currently undergoing maintenance to increase optimization. User statistics are temporarily disabled until 5/29. Sorry for the inconvenience!"
                    />
                </div>
            )}
            <p className="w-4/5 sm:w-3/6 min-w-24 sm:min-w-96 mx-auto mt-16 text-justify sm:text-start text-md sm:text-lg">
                Have you ever wondered about your Letterboxd rating
                distribution, how it compares to the community, or the
                popularity of the movies you've watched? Your profile might have
                some interesting statistics...
            </p>
            {!gettingStats && (
                <form
                    className="w-fit mx-auto my-4"
                    onSubmit={handleSubmit(onSubmit, onError)}
                    noValidate
                >
                    <div className="form-control flex flex-col">
                        <label
                            className={`text-center text-xl ${
                                !statistics &&
                                getValues("username") === "" &&
                                "mb-4"
                            }`}
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
                    {isDirty && isValid && !gettingStats && (
                        <button
                            className={`mx-auto mt-4 ${
                                statistics && "mb-4"
                            } p-2 block text-xl border-2 rounded-md hover:border-amber-800 hover:shadow-md transition duration-200`}
                        >
                            Get Statistics
                        </button>
                    )}
                </form>
            )}
            {gettingStats && (
                <p className="w-fit mx-auto my-4 text-l sm:text-xl text-amber-800">
                    calculating statistics...
                </p>
            )}
            {!gettingStats && statistics && (
                <div className="w-fit mx-auto mt-8">
                    <StatsTable statistics={statistics} />
                    <CategoryDefinitions />
                </div>
            )}
            {!gettingStats && statistics && percentiles && (
                <PercentilesDisplay percentiles={percentiles} />
            )}
            {distribution && (
                <img
                    className="w-fit min-w-24 sm:w-[500px] block mx-auto my-4 border-2 border-solid rounded-md border-amber-800"
                    src={distribution}
                    alt="${username}'s rating distribution"
                ></img>
            )}
            <p className="mx-auto my-4 text-center">
                Follow my{" "}
                <a
                    className="underline decoration-amber-800 hover:text-amber-800 hover:shadow-md"
                    href="https://letterboxd.com/victorverma"
                    target="_blank"
                >
                    Letterboxd account
                </a>
                !
            </p>
        </div>
    );
};

export default Statistics;
