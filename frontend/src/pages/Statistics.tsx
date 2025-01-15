import { useState } from "react";
import axios, { AxiosError } from "axios";
import { useForm, FieldErrors } from "react-hook-form";
import { useSnackbar } from "notistack";

import DefinitionsModal from "../components/DefinitionsModal";
import GenreStatsTable from "../components/GenreStatsTable";
import LinearIndeterminate from "../components/LinearIndeterminate";
import PercentilesDisplay from "../components/PercentilesDisplay";
import StatsTable from "../components/StatsTable";
import PageTitle from "../components/PageTitle";
import CycleText from "../components/CycleText";

const backend = import.meta.env.VITE_BACKEND_URL;

type FormValues = {
    username: string;
};

type GenreAverage = {
    mean_rating_differential: number;
    mean_user_rating: number;
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
    genre_averages: {
        action: GenreAverage;
        adventure: GenreAverage;
        animation: GenreAverage;
        comedy: GenreAverage;
        crime: GenreAverage;
        documentary: GenreAverage;
        drama: GenreAverage;
        family: GenreAverage;
        fantasy: GenreAverage;
        history: GenreAverage;
        horror: GenreAverage;
        music: GenreAverage;
        mystery: GenreAverage;
        romance: GenreAverage;
        science_fiction: GenreAverage;
        thriller: GenreAverage;
        tv_movie: GenreAverage;
        war: GenreAverage;
        western: GenreAverage;
    };
};

type PercentilesResponse = {
    user_rating_percentile: number;
    letterboxd_rating_percentile: number;
    rating_differential_percentile: number;
    letterboxd_rating_count_percentile: number;
};

const categoryDefinitions = [
    {
        term: "Mean User Rating",
        definition:
            ": The average rating the user gives to a movie on Letterboxd.",
    },
    {
        term: "Mean Letterboxd Rating",
        definition:
            ": The average Letterboxd community rating of movies that the user has rated.",
    },
    {
        term: "Mean Rating Differential",
        definition:
            ": The average difference between the user's rating and the Letterboxd community rating on a movie.",
    },
    {
        term: "Mean Letterboxd Rating Count",
        definition:
            ": The average number of Letterboxd community ratings across the movies the user has rated.",
    },
];

const additionalStatsDefinitions = [
    {
        term: "Genre",
        definition: ": The genre of the movie.",
    },
    {
        term: "Mean User Rating",
        definition:
            ": The average rating the user gives to a movie of that genre on Letterboxd.",
    },
    {
        term: "Mean Rating Diff",
        definition:
            ": The average difference between the user's rating and the Letterboxd community rating on a movie of that genre.",
    },
];

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
                    console.log(errorMessage);
                    enqueueSnackbar(errorMessage, { variant: "error" });
                } else {
                    console.log(error);
                    enqueueSnackbar("Error", { variant: "error" });
                }
            }
        } else {
            console.log("using cached response");
            enqueueSnackbar("Identical user query - using cached response", {
                variant: "info",
            });
        }
        setGettingStats(false);
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
        getStatistics(username);
    };

    const onError = (errors: FieldErrors<FormValues>) => {
        console.log("form errors", errors);
    };

    return (
        <div>
            <PageTitle title="Letterboxd User Statistics" />

            <div className="my-16">
                <CycleText
                    texts={[
                        "How does your profile compare to other Letterboxd users?",
                        "What are your highest and lowest rated genres?",
                        "What is the distribution of your Letterboxd ratings?",
                    ]}
                    cycleTime={4000}
                />
            </div>

            {!gettingStats && (
                <form
                    className="w-fit mx-auto mt-8 flex flex-col space-y-4"
                    onSubmit={handleSubmit(onSubmit, onError)}
                    noValidate
                >
                    <label
                        className="text-center text-xl text-palette-darkbrown"
                        htmlFor="username"
                    >
                        Enter Letterboxd Username
                    </label>
                    <div className="form-control flex flex-col">
                        <input
                            className="w-64 sm:w-96 mx-auto p-1 text-center rounded-md bg-gray-200"
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
                        <button className="block mx-auto p-2 rounded-md hover:shadow-md bg-gray-200 hover:bg-palette-lightbrown">
                            Get Statistics
                        </button>
                    )}
                </form>
            )}

            {gettingStats && (
                <div className="w-fit mx-auto">
                    <p className="w-fit mx-auto my-4 sm:text-xl text-palette-darkbrown">
                        Calculating statistics...
                    </p>
                    <LinearIndeterminate />
                </div>
            )}

            {!gettingStats && statistics && (
                <div className="w-9/10 md:w-[640px] mx-auto mt-8">
                    <StatsTable
                        statistics={{
                            user_rating: statistics["user_rating"],
                            letterboxd_rating: statistics["letterboxd_rating"],
                            rating_differential:
                                statistics["rating_differential"],
                            letterboxd_rating_count:
                                statistics["letterboxd_rating_count"],
                        }}
                    />
                    <DefinitionsModal
                        title={"Category Definitions"}
                        definitions={categoryDefinitions}
                    />
                </div>
            )}

            {!gettingStats && statistics && percentiles && (
                <PercentilesDisplay percentiles={percentiles} />
            )}

            {!gettingStats && statistics && percentiles && (
                <div className="w-9/10 md:w-[640px] mx-auto mt-12">
                    <GenreStatsTable
                        statistics={statistics["genre_averages"]}
                    />
                    <DefinitionsModal
                        title={"Additional Stats Definitions"}
                        definitions={additionalStatsDefinitions}
                    />
                </div>
            )}

            {distribution && (
                <img
                    className="w-9/10 md:w-[640px] block mx-auto my-8 border-2 border-solid rounded-md"
                    src={distribution}
                    alt={`${currentUser}'s rating distribution`}
                />
            )}
        </div>
    );
};

export default Statistics;
