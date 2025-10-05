import { useState } from "react";
import axios from "axios";
import { Helmet } from "react-helmet-async";
import { useForm, FieldErrors } from "react-hook-form";
import { enqueueSnackbar } from "notistack";

import LinearIndeterminate from "../components/LinearIndeterminate";
import PageTitle from "../components/Layout/PageTitle";

import {
    CompatibilityFormValues,
    CompatibilityResponse,
    CompatibilityQuery,
} from "../types/CompatibilityTypes";

const backend = import.meta.env.VITE_BACKEND_URL;

const isQueryEqual = (
    previousQuery: CompatibilityQuery,
    currentQuery: CompatibilityQuery
): boolean => {
    if (
        previousQuery.username_1 === currentQuery.username_2 &&
        previousQuery.username_2 === currentQuery.username_1
    )
        return true;
    if (previousQuery.username_1 !== currentQuery.username_1) return false;
    if (previousQuery.username_2 !== currentQuery.username_2) return false;

    return true;
};

const Compatibility = () => {
    const [previousQuery, setPreviousQuery] = useState<CompatibilityQuery>({
        username_1: "",
        username_2: "",
    });

    const [compatibility, setCompatibility] =
        useState<null | CompatibilityResponse>(null);
    const [gettingCompatibility, setGettingCompatibility] = useState(false);

    const getCompatibility = async (username1: string, username2: string) => {
        const currentQuery = {
            username_1: username1
                .replace("https://letterboxd.com/", "")
                .replace("/", ""),
            username_2: username2
                .replace("https://letterboxd.com/", "")
                .replace("/", ""),
        };
        if (!isQueryEqual(previousQuery, currentQuery)) {
            setGettingCompatibility(true);
            setCompatibility(null);
            try {
                // console.log(currentQuery);
                const response = await axios.post(
                    `${backend}/api/get-compatibility`,
                    { currentQuery }
                );
                console.log(response.data.data);
                setCompatibility(response.data.data);
                setPreviousQuery(currentQuery);
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
        setGettingCompatibility(false);
    };

    const form = useForm<CompatibilityFormValues>({
        defaultValues: {
            username1: "",
            username2: "",
        },
    });
    const { register, handleSubmit, watch } = form;
    const watchUsername1 = watch("username1");
    const watchUsername2 = watch("username2");

    const onSubmit = (formData: CompatibilityFormValues) => {
        const username1 = formData.username1.trim();
        if (username1 === "") {
            enqueueSnackbar("Must enter valid username(s)", {
                variant: "error",
            });
            return;
        }
        if (username1.includes(",")) {
            enqueueSnackbar("Only one username is allowed per field", {
                variant: "error",
            });
            return;
        }

        const username2 = formData.username2.trim();
        if (username2 === "") {
            enqueueSnackbar("Must enter valid username(s)", {
                variant: "error",
            });
            return;
        }
        if (username2.includes(",")) {
            enqueueSnackbar("Only one username is allowed per field", {
                variant: "error",
            });
            return;
        }

        if (username1 === username2) {
            enqueueSnackbar("Usernames must be different", {
                variant: "error",
            });
            return;
        }

        getCompatibility(username1, username2);
    };

    const onError = (errors: FieldErrors<CompatibilityFormValues>) => {
        console.log("Form errors", errors);
    };
    return (
        <div>
            <div className="my-2">
                <Helmet>
                    <title>Letterboxd Profile Compatibility</title>
                    <link
                        rel="canonical"
                        href="https://recommendations.victorverma.com/compatibility"
                    />
                </Helmet>

                <PageTitle title="Letterboxd Profile Compatibility" />

                {!gettingCompatibility && (
                    <form
                        className="w-fit mx-auto mt-8 flex flex-col space-y-4"
                        onSubmit={handleSubmit(onSubmit, onError)}
                        noValidate
                    >
                        <label
                            className="text-center text-xl text-palette-darkbrown"
                            htmlFor="username1"
                        >
                            Enter Letterboxd Usernames
                        </label>
                        <div className="form-control flex flex-col align-center">
                            <input
                                className="w-64 sm:w-96 mx-auto p-1 text-center rounded-md bg-gray-200"
                                type="text"
                                placeholder={"First username"}
                                {...register("username1")}
                            />
                        </div>
                        <div className="form-control flex flex-col align-center">
                            <input
                                className="w-64 sm:w-96 mx-auto p-1 text-center rounded-md bg-gray-200"
                                type="text"
                                placeholder={"Second username"}
                                {...register("username2")}
                            />
                        </div>

                        {watchUsername1.trim() !== "" &&
                            watchUsername2.trim() !== "" && (
                                <button className="block mx-auto p-2 rounded-md hover:shadow-md bg-gray-200 hover:bg-palette-lightbrown">
                                    Get Compatibility
                                </button>
                            )}
                    </form>
                )}

                {gettingCompatibility && (
                    <div className="w-fit mx-auto">
                        <p className="mx-auto my-8 sm:text-xl text-palette-darkbrown">
                            Calculating compatibility...
                        </p>
                        <LinearIndeterminate />
                    </div>
                )}

                {!gettingCompatibility && compatibility && (
                    <div className="w-80 sm:w-128 mx-auto mt-8 flex flex-col space-y-4">
                        <h2 className="w-fit mx-auto text-xl sm:text-2xl">
                            Film Compatibility Score
                        </h2>
                        <p className="w-fit mx-auto text-3xl sm:text-4xl text-palette-darkbrown">
                            {compatibility.compatibility_score}
                        </p>
                        <p className="text-justify sm:text-left">
                            Based on their Letterboxd profiles,{" "}
                            <span className="text-palette-darkbrown">
                                {compatibility.username_1}
                            </span>{" "}
                            and{" "}
                            <span className="text-palette-darkbrown">
                                {compatibility.username_2}
                            </span>{" "}
                            have a film compatibility score of{" "}
                            {compatibility.compatibility_score}. The score
                            ranges from 0 to 100, and a higher score indicates
                            greater compability.
                        </p>
                        <p className="text-justify sm:text-left">
                            This metric is calculated by looking at the
                            similarity between rating patterns. If the two users
                            tend to similarly rate movies with similar
                            characteristics, their film compatibility score will
                            be higher. The FAQ contains a deeper technical
                            explanation.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Compatibility;
