import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { useSnackbar } from "notistack";

import PercentilesDisplay from "../Displays/PercentilesDisplay";
import StatsTable from "../Tables/StatsTable";

import {
    PercentilesResponse,
    SimpleStatsResponse,
} from "../../types/StatisticsTypes";

const isMobile = /Mobi|Android/i.test(navigator.userAgent);

interface ExportStatisticsProps {
    simpleStats: SimpleStatsResponse;
    percentiles: PercentilesResponse;
    currentUser: string;
    generatedDatetime: string;
}

const ExportStatistics = ({
    simpleStats,
    percentiles,
    currentUser,
    generatedDatetime,
}: ExportStatisticsProps) => {
    const { enqueueSnackbar } = useSnackbar();

    const statisticsRef = useRef<HTMLDivElement | null>(null);
    const [renderExport, setRenderExport] = useState<boolean>(false);

    const handleShareStatistics = async () => {
        setRenderExport(true);
        requestAnimationFrame(async () => {
            if (!statisticsRef.current) {
                setRenderExport(false);
                enqueueSnackbar("Statistics ref does not exist", {
                    variant: "info",
                });
                return;
            }

            try {
                const dataUrl = await toPng(statisticsRef.current, {
                    cacheBust: true,
                    backgroundColor: "#fff",
                });

                if (isMobile) {
                    const res = await fetch(dataUrl);
                    const blob = await res.blob();
                    const file = new File([blob], "letterboxd_statistics.png", {
                        type: "image/png",
                    });

                    const canShareFile = navigator.canShare?.({
                        files: [file],
                    });

                    if (canShareFile) {
                        await navigator.share({
                            files: [file],
                            title: "Letterboxd Statistics",
                        });
                    } else {
                        const link = document.createElement("a");
                        link.href = dataUrl;
                        link.download = "letterboxd_statistics.png";
                        link.click();
                        enqueueSnackbar(
                            "Image downloaded instead (sharing not supported).",
                            {
                                variant: "info",
                            }
                        );
                    }
                } else {
                    const link = document.createElement("a");
                    link.href = dataUrl;
                    link.download = "letterboxd_statistics.png";
                    link.click();
                }
            } catch (err) {
                console.error("Failed to export statistics:", err);
                enqueueSnackbar("Failed to export statistics", {
                    variant: "error",
                });
            }
            setRenderExport(false);
        });
    };

    return (
        <>
            {renderExport && (
                <div
                    className="absolute pointer-events-none"
                    style={{
                        top: "-99999px",
                        left: "-99999px",
                    }}
                >
                    <div
                        ref={statisticsRef}
                        className="p-2"
                        style={{
                            width: "900px",
                            minWidth: "900px",
                            maxWidth: "900px",
                        }}
                    >
                        <div className="mb-4 flex justify-between">
                            <h1 className="text-palette-darkbrown">
                                Letterboxd Profile Statistics
                            </h1>
                            <h1 className="text-palette-darkbrown">
                                {currentUser}
                            </h1>
                        </div>

                        <div className="max-w-4/5 mx-auto">
                            <StatsTable statistics={simpleStats} />
                        </div>

                        <PercentilesDisplay percentiles={percentiles} />

                        <div className="w-full max-w-4/5 md:max-w-none mx-auto my-8 grid grid-cols-4 gap-4 text-center">
                            <div>
                                <h2 className="text-xl">Silent Era Average</h2>
                                <p className="text-3xl text-palette-darkbrown font-semibold">
                                    {simpleStats.era_averages["silent"]}
                                </p>
                            </div>
                            <div>
                                <h2 className="text-xl">Sound Era Average</h2>
                                <p className="text-3xl text-palette-darkbrown font-semibold">
                                    {simpleStats.era_averages["sound"]}
                                </p>
                            </div>
                            <div>
                                <h2 className="text-xl">Color Era Average</h2>
                                <p className="text-3xl text-palette-darkbrown font-semibold">
                                    {simpleStats.era_averages["color"]}
                                </p>
                            </div>
                            <div>
                                <h2 className="text-xl">Modern Era Average</h2>
                                <p className="text-3xl text-palette-darkbrown font-semibold">
                                    {simpleStats.era_averages["modern"]}
                                </p>
                            </div>
                        </div>

                        <div className="mt-2 flex justify-between">
                            <h1 className="text-palette-darkbrown">
                                https://recommendations.victorverma.com
                            </h1>
                            <h1 className="text-palette-darkbrown">
                                {generatedDatetime}
                            </h1>
                        </div>
                    </div>
                </div>
            )}

            <button
                onClick={handleShareStatistics}
                className="block mt-4 mx-auto p-2 rounded-md hover:shadow-md bg-gray-200 hover:bg-palette-lightbrown"
            >
                Share Statistics
            </button>
        </>
    );
};

export default ExportStatistics;
