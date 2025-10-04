import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import axios from "axios";
import { enqueueSnackbar } from "notistack";

import FAQSection from "../components/FAQSection";
import LinearIndeterminate from "../components/LinearIndeterminate";
import PageTitle from "../components/Layout/PageTitle";

import { QA } from "../types/FAQTypes";

const backend = import.meta.env.VITE_BACKEND_URL;

const sections = [
    { title: "General", section: "general" },
    { title: "Recommendations", section: "recommendations" },
    { title: "Statistics", section: "statistics" },
    { title: "Watchlist Picker", section: "watchlist" },
    { title: "Compatibility", section: "compatibility" },
];

const FrequentlyAskedQuestions = () => {
    const [FAQ, setFAQ] = useState<QA[]>([]);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        const fetchFAQ = async () => {
            setLoading(true);
            try {
                const FAQResponse = await axios.get(
                    `${backend}/api/get-frequently-asked-questions`
                );
                // console.log(FAQResponse.data.data);
                setFAQ(FAQResponse.data.data);
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
        fetchFAQ();
    }, []);
    return (
        <div className="my-2">
            <Helmet>
                <title>Frequently Asked Questions</title>
                <link
                    rel="canonical"
                    href="https://recommendations.victorverma.com/frequently-asked-questions"
                />
            </Helmet>

            <PageTitle title="Frequently Asked Questions" />

            {loading && (
                <div className="w-64 mt-8 mx-auto">
                    <LinearIndeterminate />
                </div>
            )}

            {!loading && FAQ && (
                <div className="flex flex-col space-y-4">
                    {sections.map((section, index) => (
                        <FAQSection
                            key={index}
                            title={section.title}
                            items={FAQ.filter(
                                (item) => item.section === section.section
                            )}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default FrequentlyAskedQuestions;
