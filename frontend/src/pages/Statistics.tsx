import { useState } from "react";
import axios, { AxiosError } from "axios";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { useForm, FieldErrors } from "react-hook-form";
import { useSnackbar } from "notistack";

import DefinitionsModal from "../components/DefinitionsModal";
import ExportableStats from "../components/ExportableStats";
import html2canvas from "html2canvas";
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
        console.log(`getting ${username} statistics`);
        getStatistics(username);
    };

    const onError = (errors: FieldErrors<FormValues>) => {
        console.log("form errors", errors);
    };

    const handleExportStats = async () => {
        if (statistics && distribution && percentiles) {
            const exportableContent = (
                <ExportableStats
                    statistics={statistics}
                    distribution={distribution}
                    percentiles={percentiles}
                />
            );

            const tempContainer = document.createElement("div");
            document.body.appendChild(tempContainer);
            const root = createRoot(tempContainer);
            flushSync(() => root.render(exportableContent));

            const canvas = await html2canvas(tempContainer);
            const dataURL = canvas.toDataURL("image/png");

            if (navigator.share) {
                await navigator.share({
                    title: "Letterboxd Stats",
                    files: [
                        new File([dataURL], "letterboxd_stats.png", {
                            type: "image/png",
                        }),
                    ],
                });
            } else {
                const a = document.createElement("a");
                a.href = dataURL;
                a.download = "letterboxd_stats.png";
                a.click();
            }

            root.unmount();
            document.body.removeChild(tempContainer);
        }
    };

    return (
        <div>
            <h1 className="w-96 max-w-full mx-auto mt-16 text-center text-4xl">
                Letterboxd User Statistics
            </h1>
            <p className="w-4/5 sm:w-3/6 min-w-24 sm:min-w-96 mx-auto mt-16 text-justify sm:text-start text-md sm:text-lg">
                Have you ever wondered about your Letterboxd rating
                distribution, how it compares to the community, or the
                popularity of the movies you've watched? Your profile might have
                some interesting statistics...
            </p>
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
                        } p-2 block text-xl border-2 border-solid border-white rounded-md hover:border-amber-800 hover:shadow-md transition duration-200`}
                    >
                        Get Statistics
                    </button>
                )}
            </form>
            {gettingStats && (
                <p className="w-fit mx-auto mb-4">calculating statistics...</p>
            )}
            {!gettingStats && statistics && (
                <div className="w-fit mx-auto mt-8">
                    <StatsTable statistics={statistics} />
                    <DefinitionsModal />
                </div>
            )}
            {!gettingStats && statistics && percentiles && (
                <PercentilesDisplay percentiles={percentiles} />
            )}
            {distribution && (
                <img
                    className="block mx-auto mt-4"
                    src={distribution}
                    alt="${username}'s rating distribution"
                ></img>
            )}
            {!gettingStats && statistics && distribution && percentiles && (
                <button
                    className="block mx-auto my-8 p-2 border-2 border-white rounded-md hover:border-amber-800 hover:shadow-md transition duration-200"
                    onClick={handleExportStats}
                >
                    Export Stats
                </button>
            )}
        </div>
    );
};

export default Statistics;
