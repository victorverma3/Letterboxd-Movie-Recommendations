import { useState } from "react";
import axios, { AxiosError } from "axios";
import { useSnackbar } from "notistack";
import { useForm, useFieldArray, FieldErrors } from "react-hook-form";
import { AiOutlineMinusCircle, AiOutlinePlusCircle } from "react-icons/ai";
import { useMediaQuery } from "react-responsive";

import CustomCheckbox from "./CustomCheckbox";
import PickTable from "./PickTable";

const backend = import.meta.env.VITE_BACKEND_URL;

type FormValues = {
    userList: { user: string }[];
    overlap: string;
    numPicks: number;
};

type PickResponse = {
    title: string;
    url: string;
};

const Picks = () => {
    const { enqueueSnackbar } = useSnackbar();
    const [gettingPicks, setGettingPicks] = useState(false);
    const [overlap, setOverlap] = useState(true);
    const [picks, setPicks] = useState<null | PickResponse[]>(null);
    const isSmallScreen = useMediaQuery({ query: "(max-width: 640px)" });
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

    interface getPicksProps {
        userList: string[];
    }

    const getPicks = async (data: getPicksProps) => {
        setGettingPicks(true);
        setPicks(null);

        try {
            console.log(data);
            const response = await axios.post(
                `${backend}/api/get-watchlist-picks`,
                { data }
            );
            console.log(response.data);
            setPicks(response.data);
        } catch (error) {
            if (error instanceof AxiosError && error?.response?.status) {
                const errorMessage = new DOMParser()
                    .parseFromString(error.response.data, "text/html")
                    .querySelector("p")?.textContent;
                console.error(errorMessage);
                enqueueSnackbar(errorMessage, { variant: "error" });
            } else {
                console.error(error);
            }
        }
        setGettingPicks(false);
    };

    const onSubmit = (formData: FormValues) => {
        const data = {
            ...formData,
            userList: formData.userList
                .map((item) => item.user.trim())
                .filter((user) => user !== ""),
            overlap: overlap === true ? "y" : "n",
            numPicks: 5,
        };
        getPicks(data);
    };

    const onError = (errors: FieldErrors<FormValues>) => {
        console.log("form errors", errors);
    };

    const isUserListValid = userList.some((item) => item.user.trim() !== "");

    return (
        <div>
            {!gettingPicks && (
                <form
                    className="w-fit mx-auto mt-16 sm:mt-24"
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
                    <div>
                        {userList.length > 1 && (
                            <CustomCheckbox
                                label="Only consider movies in common across watchlists"
                                labelPlacement="start"
                                checked={overlap}
                                setChecked={setOverlap}
                            />
                        )}
                    </div>
                    {isUserListValid && !gettingPicks && (
                        <button className="mx-auto my-4 p-2 block text-xl border-2 rounded-md hover:border-amber-800 hover:shadow-md transition duration-200">
                            Get Watchlist Picks
                        </button>
                    )}
                </form>
            )}
            {gettingPicks && (
                <p className="w-fit mx-auto my-8 text-l sm:text-xl">
                    {userList.length > 1
                        ? "choosing from watchlists..."
                        : "choosing from watchlist..."}
                </p>
            )}
            {!gettingPicks && picks && (
                <div className="w-fit mx-auto my-8">
                    <PickTable
                        picks={picks}
                        width={isSmallScreen ? 256 : 384}
                    />
                </div>
            )}
        </div>
    );
};

export default Picks;
