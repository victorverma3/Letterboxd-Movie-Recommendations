import { useState } from "react";
import axios from "axios";
import { useForm, FieldErrors } from "react-hook-form";
import { useSnackbar } from "notistack";
import { Helmet } from "react-helmet-async";

import CycleText from "../components/CycleText";
import DefinitionsModal from "../components/Modals/DefinitionsModal";
import DistributionChart from "../components/Charts/DistributionChart";
import ErasRadarChart from "../components/Charts/ErasRadarChart";
import ExportDistribution from "../components/Exports/ExportDistribution";
import ExportStatistics from "../components/Exports/ExportStatistics";
import GenreStatsTable from "../components/Tables/GenreStatsTable";
import LinearIndeterminate from "../components/LinearIndeterminate";
import PageTitle from "../components/Layout/PageTitle";
import PercentilesDisplay from "../components/Displays/PercentilesDisplay";
import StatsTable from "../components/Tables/StatsTable";
import SquareAd from "../components/Ads/SquareAd";

import useIsScreenLg from "../hooks/useIsScreenLg";

import {
    StatisticsFormValues,
    StatisticsResponse,
} from "../types/StatisticsTypes";

const backend = import.meta.env.VITE_BACKEND_URL;

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

const eraDefinitions = [
    {
        term: "Silent Era",
        definition: ": Movies released between 1880 and 1925.",
    },
    {
        term: "Sound Era",
        definition: ": Movies released between 1925 and 1965.",
    },
    {
        term: "Color Era",
        definition: ": Movies released between 1965 and 2000.",
    },
    {
        term: "Modern Era",
        definition: ": Movies released in the year 2000 or later.",
    },
];

const Statistics = () => {
    const isScreenLg = useIsScreenLg();
    const { enqueueSnackbar } = useSnackbar();
    const [currentUser, setCurrentUser] = useState("");
    const [statistics, setStatistics] = useState<null | StatisticsResponse>(
        null
    );
    const [gettingStatistics, setGettingStatistics] = useState(false);
    const [generatedDatetime, setGeneratedDatetime] = useState<string>("");

    const getStatistics = async (username: string) => {
        username = username
            .trim()
            .replace("https://letterboxd.com/", "")
            .replace("/", "");
        if (username !== currentUser) {
            setStatistics(null);
            try {
                setGettingStatistics(true);
                const statisticsResponse = await axios.post(
                    `${backend}/api/get-statistics`,
                    { username: username }
                );
                // console.log(statisticsResponse.data.data);
                setStatistics(statisticsResponse.data.data);
                setGeneratedDatetime(new Date().toLocaleString());
                setCurrentUser(username);
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
        setGettingStatistics(false);
    };

    const form = useForm<StatisticsFormValues>({
        defaultValues: {
            username: "",
        },
    });
    const { register, handleSubmit, formState } = form;
    const { errors, isDirty, isValid } = formState;

    const onSubmit = (data: StatisticsFormValues) => {
        const username = data.username.toLowerCase();
        getStatistics(username);
    };

    const onError = (errors: FieldErrors<StatisticsFormValues>) => {
        console.log("form errors", errors);
    };

    return (
        <div className="flex gap-4">
            {isScreenLg && (
                <div className="w-[250px]">
                    <SquareAd />
                </div>
            )}
            <div className="lg:w-[700px] mx-auto">
                <Helmet>
                    <title>Letterboxd Profile Statistics</title>
                    <link
                        rel="canonical"
                        href="https://recommendations.victorverma.com/statistics"
                    />
                </Helmet>

                <PageTitle title="Letterboxd User Statistics" />

                <div className="hidden md:block my-16">
                    <CycleText
                        texts={[
                            "How does your profile compare to other Letterboxd users?",
                            "What are your highest and lowest rated genres?",
                            "What is the distribution of your Letterboxd ratings?",
                        ]}
                        cycleTime={4000}
                    />
                </div>

                {!gettingStatistics && (
                    <form
                        className="w-fit mx-auto mt-16 flex flex-col space-y-4"
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
                                placeholder="One username only"
                                {...register("username", {
                                    required: {
                                        value: true,
                                        message: "Username is required",
                                    },
                                    validate: {
                                        notEmpty: (fieldValue) => {
                                            return (
                                                fieldValue.trim() !== "" ||
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
                        {isDirty && isValid && !gettingStatistics && (
                            <button className="block mx-auto p-2 rounded-md hover:shadow-md bg-gray-200 hover:bg-palette-lightbrown">
                                Get Statistics
                            </button>
                        )}
                    </form>
                )}

                {gettingStatistics && (
                    <div className="w-fit mx-auto">
                        <p className="w-fit mx-auto mt-16 mb-4 md:my-4 sm:text-xl text-palette-darkbrown">
                            Calculating statistics...
                        </p>
                        <LinearIndeterminate />
                    </div>
                )}

                {!gettingStatistics && statistics && (
                    <>
                        {/* Statistics Export */}
                        <ExportStatistics
                            simpleStats={statistics.simple_stats}
                            percentiles={statistics.percentiles}
                            currentUser={currentUser}
                            generatedDatetime={generatedDatetime}
                        />

                        <div className="w-9/10 md:w-[640px] mx-auto mt-8">
                            <StatsTable statistics={statistics.simple_stats} />
                            <DefinitionsModal
                                title={"Category Definitions"}
                                definitions={categoryDefinitions}
                            />
                        </div>

                        {/* Percentiles */}
                        <PercentilesDisplay
                            percentiles={statistics.percentiles}
                        />

                        <div className="w-9/10 md:w-[640px] mx-auto mt-12">
                            <GenreStatsTable
                                statistics={
                                    statistics.simple_stats["genre_averages"]
                                }
                            />
                            <DefinitionsModal
                                title={"Genre Stats Definitions"}
                                definitions={additionalStatsDefinitions}
                            />
                        </div>

                        {/* Era Averages */}
                        <div className="w-9/10 md:w-[640px] mx-auto mt-12">
                            <div className="mx-auto" id="eras-chart">
                                <h3 className="w-fit mx-auto text-md md:text-lg">
                                    {`${currentUser}'s Era Averages`}
                                </h3>
                                <ErasRadarChart
                                    era_averages={
                                        statistics.simple_stats["era_averages"]
                                    }
                                />
                            </div>
                            <DefinitionsModal
                                title={"Era Definitions"}
                                definitions={eraDefinitions}
                            />
                        </div>

                        {/* User Rating Distribution */}
                        <div className="w-9/10 md:w-[640px] mx-auto mt-12">
                            <div className="mx-auto" id="distribution-chart">
                                <h3 className="w-fit mx-auto text-md md:text-lg">
                                    {`${currentUser}'s Rating Distribution`}
                                </h3>
                                <DistributionChart
                                    data={statistics.distribution}
                                />
                            </div>
                        </div>

                        <ExportDistribution
                            distribution={statistics.distribution}
                            currentUser={currentUser}
                            generatedDatetime={generatedDatetime}
                        />
                    </>
                )}
            </div>
            {isScreenLg && (
                <div className="w-[250px]">
                    <SquareAd />
                </div>
            )}
        </div>
    );
};

export default Statistics;
