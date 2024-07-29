import { useState } from "react";
import axios, { AxiosError } from "axios";
import { useForm, FieldErrors } from "react-hook-form";
import { useSnackbar } from "notistack";

// import CustomAlert from "../components/CustomAlert";
import DefinitionsModal from "../components/DefinitionsModal";
import GenreStatsTable from "../components/GenreStatsTable";
import PercentilesDisplay from "../components/PercentilesDisplay";
import StatsTable from "../components/StatsTable";

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
            enqueueSnackbar("identical user query - using cached response", {
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
    const { register, handleSubmit, formState, getValues } = form;
    const { errors, isDirty, isValid } = formState;

    const onSubmit = (data: FormValues) => {
        const username = data.username.toLowerCase();
        getStatistics(username);
    };

    const onError = (errors: FieldErrors<FormValues>) => {
        console.log("form errors", errors);
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

    return (
        <div>
            <h1 className="w-96 max-w-full mx-auto mt-16 text-center text-4xl">
                Letterboxd User Statistics
            </h1>

            {/* <CustomAlert severity="info" message="" /> */}

            <p className="w-4/5 sm:w-3/5 min-w-24 sm:min-w-96 mx-auto mt-16 text-justify sm:text-start text-md sm:text-lg">
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
            {distribution && (
                <img
                    className="w-fit min-w-24 sm:w-[500px] block mx-auto my-4 border-2 border-solid rounded-md border-amber-800"
                    src={distribution}
                    alt="${username}'s rating distribution"
                ></img>
            )}

            {!gettingStats && statistics && percentiles && (
                <div className="w-full sm:w-[500px] mx-auto mt-8">
                    <GenreStatsTable
                        statistics={statistics["genre_averages"]}
                    />
                    <DefinitionsModal
                        title={"Additional Stats Definitions"}
                        definitions={additionalStatsDefinitions}
                    />
                </div>
            )}
            <p className="mx-auto mt-12 mb-4 text-center">
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
