import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import axios from "axios";
import { enqueueSnackbar } from "notistack";

import LinearIndeterminate from "../components/LinearIndeterminate";
import PageTitle from "../components/Layout/PageTitle";
import PatchNotes from "../components/PatchNotes";

import { Note } from "../types/NotesTypes";

const backend = import.meta.env.VITE_BACKEND_URL;

const Releases = () => {
    const [notes, setNotes] = useState<Note[]>();
    const [loading, setLoading] = useState<boolean>(false);
    useEffect(() => {
        const fetchNotes = async () => {
            setLoading(true);
            try {
                const notesResponse = await axios.get(
                    `${backend}/api/get-release-notes`
                );
                setNotes(notesResponse.data);
                console.log(notesResponse.data);
            } catch (error) {
                enqueueSnackbar("Failed to get release notes", {
                    variant: "error",
                });
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
                <div className="w-4/5 sm:w-3/5 min-w-24 sm:min-w-96 mt-16 mx-auto flex flex-col space-y-4">
                    {notes.map((note, index) => (
                        <PatchNotes
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

export default Releases;
