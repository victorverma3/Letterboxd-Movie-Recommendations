import { useState } from "react";
import axios from "axios";
import { useForm, FieldErrors } from "react-hook-form";

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

const Statistics = () => {
    const [statistics, setStatistics] = useState<null | StatisticsResponse>(
        null
    );
    const [distribution, setDistribution] = useState("");
    const [gettingStats, setGettingStats] = useState(false);

    const getStatistics = async (username: string) => {
        setGettingStats(true);
        setStatistics(null);
        setDistribution("");
        try {
            const dataframeResponse = await axios.get(
                `${backend}/api/get-dataframe/${username}`
            );
            console.log(dataframeResponse.data);

            const statisticsResponse = await axios.post(
                `${backend}/api/get-statistics`,
                {
                    dataframe: dataframeResponse.data,
                }
            );
            console.log(statisticsResponse.data);
            setStatistics(statisticsResponse.data);

            const distributionResponse = await axios.post(
                `${backend}/api/get-rating-distribution/${username}`,
                { dataframe: dataframeResponse.data },
                { responseType: "arraybuffer" }
            );
            console.log("got distribution image");
            const blob = new Blob([distributionResponse.data], {
                type: "image/png",
            });
            const imageURL = URL.createObjectURL(blob);
            setDistribution(imageURL);
        } catch (error) {
            console.log(error);
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
        console.log("form submitted", data);
        getStatistics(data.username);
    };

    const onError = (errors: FieldErrors<FormValues>) => {
        console.log("form errors", errors);
    };

    return (
        <div>
            <h1 className="w-96 max-w-full mx-auto mt-16 text-center text-4xl">
                Letterboxd User Statistics
            </h1>
            <form onSubmit={handleSubmit(onSubmit, onError)} noValidate>
                <div className="form-control flex flex-col">
                    <label
                        className="mx-auto mt-16 sm:mt-32 text-xl"
                        htmlFor="username"
                    >
                        Enter Letterboxd Username
                    </label>
                    <input
                        className="w-64 sm:w-96 mx-auto mt-4 text-center border-2 border-solid border-black "
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
                    <button className="mx-auto mt-4 p-2 block text-xl border-2 border-solid border-white rounded-md hover:border-amber-800 hover:shadow-md transition duration-200">
                        Get Statistics
                    </button>
                )}
                {gettingStats && (
                    <p className="w-fit mx-auto mt-2">
                        calculating statistics...
                    </p>
                )}
                {!gettingStats && statistics && (
                    <div className="w-fit mx-auto mt-8">
                        <StatsTable statistics={statistics} />
                    </div>
                )}
                {distribution && (
                    <img
                        className="block mx-auto"
                        src={distribution}
                        alt="${username}'s rating distribution"
                    ></img>
                )}
            </form>
        </div>
    );
};

export default Statistics;
