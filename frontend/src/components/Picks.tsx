import { useState } from "react";
import axios, { AxiosError } from "axios";
import { useSnackbar } from "notistack";
import { useForm, FieldErrors } from "react-hook-form";
import { useMediaQuery } from "react-responsive";

import CustomCheckbox from "./CustomCheckbox";
import LinearIndeterminate from "./LinearIndeterminate";
import PickInstructions from "./PickInstructions";
import PickTable from "./PickTable";

const backend = import.meta.env.VITE_BACKEND_URL;

type FormValues = {
    userList: string;
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
            userList: "",
        },
    });
    const { register, handleSubmit, watch } = form;

    const watchUserList = watch("userList");

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
                enqueueSnackbar("Error", { variant: "error" });
            }
        }
        setGettingPicks(false);
    };

    const onSubmit = (formData: FormValues) => {
        const usernames = formData.userList
            .split(",")
            .map((user) => user.trim().toLowerCase())
            .filter((user) => user !== "");

        if (usernames.length === 0) {
            console.log("must enter valid username(s)");
            enqueueSnackbar("must enter valid username(s)", {
                variant: "error",
            });
            return;
        }
        const data = {
            ...formData,
            userList: formData.userList
                .split(",")
                .map((user) => user.trim().toLowerCase())
                .filter((user) => user !== ""),
            overlap: overlap === true ? "y" : "n",
            numPicks: 5,
        };

        if (data.userList.length === 0) {
            console.log("must enter valid username(s)");
            enqueueSnackbar("must enter valid username(s)", {
                variant: "error",
            });
            return;
        }

        getPicks(data);
    };

    const onError = (errors: FieldErrors<FormValues>) => {
        console.log("form errors", errors);
    };

    return (
        <div>
            <PickInstructions />
            {!gettingPicks && (
                <form
                    className="w-fit mx-auto mt-4"
                    onSubmit={handleSubmit(onSubmit, onError)}
                    noValidate
                >
                    <div className="w-fit mx-auto my-4 flex flex-col">
                        <div className="w-fit mx-auto my-4 flex flex-col">
                            <label
                                className="text-center text-xl"
                                htmlFor="username"
                            >
                                Enter Letterboxd Username(s)
                            </label>
                            <div className="form-control flex flex-col align-center">
                                <input
                                    className="w-64 sm:w-96 mx-auto mt-4 text-center border-2 border-solid border-black"
                                    type="text"
                                    placeholder="Separate by comma"
                                    {...register("userList")}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="w-4/5 sm:w-3/6 min-w-24 sm:min-w-96 mx-auto">
                        {watchUserList.includes(",") && (
                            <CustomCheckbox
                                label="Only consider movies in common across watchlists"
                                labelPlacement="start"
                                checked={overlap}
                                setChecked={setOverlap}
                            />
                        )}
                    </div>
                    {watchUserList.trim() !== "" && !gettingPicks && (
                        <button className="mx-auto my-4 p-2 block text-xl border-2 rounded-md hover:border-amber-800 hover:shadow-md transition duration-200">
                            Get Watchlist Picks
                        </button>
                    )}
                </form>
            )}
            {gettingPicks && (
                <div className="w-fit mx-auto">
                    <p className="w-fit mx-auto my-8 text-l sm:text-xl text-amber-800">
                        {watchUserList.length > 1
                            ? "Choosing from watchlists..."
                            : "Choosing from watchlist..."}
                    </p>
                    <LinearIndeterminate />
                </div>
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
