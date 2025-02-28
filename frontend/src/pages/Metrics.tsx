import { useEffect, useState } from "react";
import axios from "axios";
import { useSnackbar } from "notistack";

import LinearIndeterminate from "../components/LinearIndeterminate";
import PageTitle from "../components/Layout/PageTitle";
import UsersChart from "../components/Charts/UsersChart";
import UsesChart from "../components/Charts/UsesChart";

import { Metric } from "../types/MetricsTypes";

const backend = import.meta.env.VITE_BACKEND_URL;

const Metrics = () => {
    const { enqueueSnackbar } = useSnackbar();
    const [metrics, SetMetrics] = useState<Metric[]>();
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        const fetchMetrics = async () => {
            setLoading(true);
            try {
                const metricsResponse = await axios.get(
                    `${backend}/api/get-application-metrics`
                );
                SetMetrics(metricsResponse.data);
                console.log(metricsResponse.data);
            } catch (error) {
                enqueueSnackbar("Failed to get application metrics", {
                    variant: "error",
                });
            }
            setLoading(false);
        };
        fetchMetrics();
    }, [enqueueSnackbar]);
    return (
        <div className="my-2 flex flex-col gap-y-8">
            <PageTitle title="Metrics" />

            <p className="w-4/5 md:w-3/5 max-w-[640px] mx-auto text-sm md:text-base">
                I originally created this website as a passion project, and I am
                pleasantly surprised that it has gained popularity. Thank you to
                everyone that has used this site, and be sure to share it with
                your friends and family who use Letterboxd. I'm always open to
                feature suggestions and feedback, which can be sent through the
                form linked at the bottom of the page.
            </p>

            {loading && (
                <div className="w-64 mx-auto">
                    <LinearIndeterminate />
                </div>
            )}

            {!loading && metrics && (
                <>
                    <div className="w-4/5 md:w-3/5 max-w-[640px] mx-auto">
                        <h3 className="w-fit mx-auto text-md md:text-lg">
                            Cumulative Users Over Time
                        </h3>
                        <UsersChart data={metrics} />
                    </div>
                    <div className="w-4/5 md:w-3/5 max-w-[640px] mx-auto">
                        <h3 className="w-fit mx-auto text-md md:text-lg">
                            Total Uses Over Time
                        </h3>
                        <UsesChart
                            data={metrics.filter((item) => item.total_uses)}
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default Metrics;
