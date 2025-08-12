import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import axios from "axios";
import { enqueueSnackbar } from "notistack";

import LinearIndeterminate from "../components/LinearIndeterminate";
import PageTitle from "../components/Layout/PageTitle";
import ReleaseNotesSection from "../components/ReleaseNotesSection";

import { ReleaseNote } from "../types/ReleaseNotesTypes";

const backend = import.meta.env.VITE_BACKEND_URL;

const ReleaseNotes = () => {
    const [notes, setNotes] = useState<ReleaseNote[]>();
    const [loading, setLoading] = useState<boolean>(false);
    useEffect(() => {
        const fetchNotes = async () => {
            setLoading(true);
            try {
                const notesResponse = await axios.get(
                    `${backend}/api/get-release-notes`
                );
                // console.log(notesResponse.data.data);
                setNotes(notesResponse.data.data);
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
            setLoading(false);
        };
        fetchNotes();
    }, []);
    return (
        <div>
            <Helmet>
                <title>Release Notes</title>
                <link
                    rel="canonical"
                    href="https://www.recommendations.victorverma.com/release-notes"
                />
            </Helmet>

            <PageTitle title="Release Notes" />

            {loading && (
                <div className="w-64 mx-auto">
                    <LinearIndeterminate />
                </div>
            )}

            {!loading && notes && (
                <div className="w-4/5 sm:w-3/5 min-w-24 sm:min-w-96 mt-12 mx-auto flex flex-col space-y-4">
                    {notes.map((note, index) => (
                        <ReleaseNotesSection
                            key={index}
                            release={note.release}
                            date={note.date}
                            notes={note.notes}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReleaseNotes;
