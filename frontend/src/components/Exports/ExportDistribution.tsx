import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { useSnackbar } from "notistack";

import DistributionChart from "../Charts/DistributionChart";

import { sleep } from "../../Utils";

import { DistributionResponse } from "../../types/StatisticsTypes";

const isMobile = /Mobi|Android/i.test(navigator.userAgent);

interface ExportDistributionType {
    distribution: DistributionResponse;
    currentUser: string;
    generatedDatetime: string;
}

const ExportDistribution = ({
    distribution,
    currentUser,
    generatedDatetime,
}: ExportDistributionType) => {
    const { enqueueSnackbar } = useSnackbar();
    const distributionRef = useRef<HTMLDivElement | null>(null);
    const [renderExport, setRenderExport] = useState<boolean>(false);

    const handleDownloadDistribution = async () => {
        setRenderExport(true);
        requestAnimationFrame(async () => {
            if (!distributionRef.current) {
                setRenderExport(false);
                enqueueSnackbar("Distribution ref does not exist", {
                    variant: "info",
                });
                return;
            }

            await sleep(1750);

            try {
                const dataUrl = await toPng(distributionRef.current, {
                    cacheBust: true,
                    backgroundColor: "#fff",
                    width: 600,
                });

                if (isMobile) {
                    const res = await fetch(dataUrl);
                    const blob = await res.blob();
                    const file = new File([blob], "distribution.png", {
                        type: "image/png",
                    });

                    const canShareFile = navigator.canShare?.({
                        files: [file],
                    });

                    if (canShareFile) {
                        await navigator.share({
                            files: [file],
                            title: "Letterboxd Recommendations",
                        });
                    } else {
                        enqueueSnackbar("Failed to save image.", {
                            variant: "error",
                        });
                    }
                } else {
                    const link = document.createElement("a");
                    link.href = dataUrl;
                    link.download = "distribution.png";
                    link.click();
                }
            } catch (err) {
                console.error("Failed to export distribution:", err);
                enqueueSnackbar("Failed to export distribution", {
                    variant: "error",
                });
            }
            setRenderExport(false);
        });
    };

    return (
        <>
            {renderExport && (
                <div className="w-[600px] p-2" ref={distributionRef}>
                    <div className="mx-auto" id="distribution-chart">
                        <h3 className="w-fit mx-auto text-md md:text-lg">
                            {`${currentUser}'s Rating Distribution`}
                        </h3>
                        <DistributionChart data={distribution} />
                    </div>
                    <div className="flex justify-between">
                        <h1 className="text-palette-darkbrown">
                            www.recommendations.victorverma.com
                        </h1>
                        <h1 className="text-palette-darkbrown">
                            {generatedDatetime}
                        </h1>
                    </div>
                </div>
            )}

            <button
                onClick={handleDownloadDistribution}
                className="block mx-auto p-2 rounded-md hover:shadow-md bg-gray-200 hover:bg-palette-lightbrown"
            >
                Download Distribution
            </button>
        </>
    );
};

export default ExportDistribution;
