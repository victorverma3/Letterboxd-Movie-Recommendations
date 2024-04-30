import { useState } from "react";
import axios from "axios";
import { useForm, FieldErrors } from "react-hook-form";

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

const Recommendation = () => {
    const [recommendations, setRecommendations] = useState<
        null | RecommendationResponse[]
    >(null);
    const [gettingRecs, setGettingRecs] = useState(false);

    const getRecommendations = async (username: string) => {
        setGettingRecs(true);
        setRecommendations(null);
        try {
            const response = await axios.post(
                `${backend}/api/get-recommendations`,
                { username: username }
            );
            console.log(response.data);
            setRecommendations(response.data);
        } catch (error) {
            console.log(error);
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
        console.log("Form submitted", data);
        getRecommendations(data.username);
    };

    const onError = (errors: FieldErrors<FormValues>) => {
        console.log("Form errors", errors);
    };

    return (
        <div>
            <form
                className="w-fit mx-auto mt-16 sm:mt-32"
                onSubmit={handleSubmit(onSubmit, onError)}
                noValidate
            >
                <div className="form-control flex flex-col">
                    <label className="text-center text-xl" htmlFor="username">
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
                    <button className="mx-auto mt-4 p-2 block text-xl border-2 border-solid border-white rounded-md hover:border-amber-800 hover:shadow-md transition duration-200">
                        Get Recommendations
                    </button>
                )}
                {gettingRecs && (
                    <p className="w-fit mx-auto mt-2">
                        generating recommendations...
                    </p>
                )}

                {!gettingRecs && recommendations && (
                    <div className="w-fit mx-auto mt-8">
                        <RecTable recommendations={recommendations} />
                    </div>
                )}
            </form>
        </div>
    );
};

export default Recommendation;
