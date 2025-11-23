import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { useSnackbar } from "notistack";
import IosShareIcon from "@mui/icons-material/IosShare";
import { Tooltip } from "@mui/material";

import { RecommendationResponse } from "../../types/RecommendationsTypes";
import { PickRecommendationResponse } from "../../types/WatchlistTypes";

const isMobile = /Mobi|Android/i.test(navigator.userAgent);

interface ExportRecsProps {
    recommendations: RecommendationResponse[] | PickRecommendationResponse[];
    userList: string;
    generatedDatetime: string;
    filename: string;
    title: string;
}

const ExportRecs = ({
    recommendations,
    userList,
    generatedDatetime,
    filename,
    title,
}: ExportRecsProps) => {
    const { enqueueSnackbar } = useSnackbar();
    const [renderExport, setRenderExport] = useState<boolean>(false);
    const exportRef = useRef<HTMLDivElement | null>(null);

    const handleExport = async () => {
        setRenderExport(true);
        requestAnimationFrame(async () => {
            if (!exportRef.current) {
                setRenderExport(false);
                enqueueSnackbar("Export ref does not exist", {
                    variant: "info",
                });
                return;
            }

            try {
                const dataUrl = await toPng(exportRef.current, {
                    cacheBust: true,
                    backgroundColor: "#fff",
                    width: 1000,
                });

                if (isMobile) {
                    const res = await fetch(dataUrl);
                    const blob = await res.blob();
                    const file = new File([blob], filename, {
                        type: "image/png",
                    });

                    const canShareFile = navigator.canShare?.({
                        files: [file],
                    });

                    if (canShareFile) {
                        await navigator.share({
                            files: [file],
                            title: title,
                        });
                    } else {
                        const link = document.createElement("a");
                        link.href = dataUrl;
                        link.download = filename;
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
                    link.download = filename;
                    link.click();
                }
            } catch (err) {
                console.error("Failed to export recommendations:", err);
                enqueueSnackbar("Failed to export recommendations", {
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
                        ref={exportRef}
                        className="p-2"
                        style={{
                            width: "1000px",
                            minWidth: "1000px",
                            maxWidth: "1000px",
                        }}
                    >
                        <div className="mb-2 flex justify-between">
                            <h1 className="text-palette-darkbrown">{title}</h1>
                            <h1 className="text-palette-darkbrown">
                                {userList}
                            </h1>
                        </div>

                        <div className="grid grid-cols-3 gap-x-8">
                            <div className="space-y-2">
                                {recommendations
                                    .slice(0, 32)
                                    .map((rec, index) => (
                                        <p key={index}>
                                            {index + 1}. {rec.title} (
                                            {rec.release_year}) -{" "}
                                            {rec.predicted_rating}★
                                        </p>
                                    ))}
                            </div>
                            <div className="space-y-2">
                                {recommendations
                                    .slice(32, 64)
                                    .map((rec, index) => (
                                        <p key={index + 32}>
                                            {index + 33}. {rec.title} (
                                            {rec.release_year}) -{" "}
                                            {rec.predicted_rating}★
                                        </p>
                                    ))}
                            </div>
                            <div className="space-y-2">
                                {recommendations.slice(64).map((rec, index) => (
                                    <p key={index + 64}>
                                        {index + 65}. {rec.title} (
                                        {rec.release_year}) -{" "}
                                        {rec.predicted_rating}★
                                    </p>
                                ))}
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
            <Tooltip title="Share">
                <IosShareIcon
                    className="text-palette-darkbrown hover:cursor-pointer"
                    onClick={handleExport}
                />
            </Tooltip>
        </>
    );
};

export default ExportRecs;
