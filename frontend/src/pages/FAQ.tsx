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
    { title: "Watchlist", section: "watchlist" },
];

const FrequentlyAskedQuestions = () => {
    const [FAQ, setFAQ] = useState<QA[]>([]);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        const fetchMetrics = async () => {
            setLoading(true);
            try {
                const FAQResponse = await axios.get(
                    `${backend}/api/get-frequently-asked-questions`
                );
                // console.log(FAQResponse.data);
                setFAQ(FAQResponse.data);
            } catch (error) {
                enqueueSnackbar("Failed to get frequently asked questions", {
                    variant: "error",
                });
            }
            setLoading(false);
        };
        fetchMetrics();
    }, []);
    return (
        <div className="my-2">
            <Helmet>
                <title>Frequently Asked Questions</title>
                <link
                    rel="canonical"
                    href="https://www.recommendations.victorverma.com/frequently-asked-questions"
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
