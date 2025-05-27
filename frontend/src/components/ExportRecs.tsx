import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { useSnackbar } from "notistack";

import { RecommendationResponse } from "../types/RecommendationsTypes";

interface ExportRecsType {
    recommendations: RecommendationResponse[];
    userList: string;
    generatedDatetime: string;
}

const ExportRecs = ({
    recommendations,
    userList,
    generatedDatetime,
}: ExportRecsType) => {
    const { enqueueSnackbar } = useSnackbar();

    const [renderExport, setRenderExport] = useState<boolean>(false);

    const exportRef = useRef<HTMLDivElement | null>(null);

    const isMobile = /Mobi|Android/i.test(navigator.userAgent);

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
                    const file = new File([blob], "recommendations.png", {
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
                    link.download = "recommendations.png";
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
                <div className="w-[1000px] p-2" ref={exportRef}>
                    <div className="mb-2 flex justify-between">
                        <h1 className="text-palette-darkbrown">
                            Letterboxd Movie Recommendations
                        </h1>
                        <h1 className="text-palette-darkbrown">{userList}</h1>
                    </div>
                    <div className="grid grid-cols-2 gap-x-8">
                        <div className="space-y-2">
                            {recommendations.slice(0, 50).map((rec, index) => (
                                <p key={index}>
                                    {index + 1}. {rec.title} ({rec.release_year}
                                    ) - {rec.predicted_rating}⭐
                                </p>
                            ))}
                        </div>
                        <div className="space-y-2">
                            {recommendations.slice(50).map((rec, index) => (
                                <p key={index + 50}>
                                    {index + 51}. {rec.title} (
                                    {rec.release_year}) - {rec.predicted_rating}
                                    ⭐
                                </p>
                            ))}
                        </div>
                    </div>
                    <div className="mt-4 flex justify-between">
                        <h1 className="text-palette-darkbrown">
                            Generated on www.recommendations.victorverma.com
                        </h1>
                        <h1 className="text-palette-darkbrown">
                            {generatedDatetime}
                        </h1>
                    </div>
                </div>
            )}

            <button
                onClick={handleExport}
                className="block mt-4 mx-auto p-2 rounded-md hover:shadow-md bg-gray-200 hover:bg-palette-lightbrown"
            >
                Save Recommendations
            </button>
        </>
    );
};

export default ExportRecs;
