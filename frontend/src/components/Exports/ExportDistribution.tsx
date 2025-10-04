import { useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { useSnackbar } from "notistack";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";

import DistributionChart from "../Charts/DistributionChart";
import LinearIndeterminate from "../LinearIndeterminate";

import { sleep } from "../../Utils";

import { DistributionResponse } from "../../types/StatisticsTypes";

const isMobile = /Mobi|Android/i.test(navigator.userAgent);

interface ExportDistributionProps {
    distribution: DistributionResponse;
    currentUser: string;
    generatedDatetime: string;
}

const ExportDistribution = ({
    distribution,
    currentUser,
    generatedDatetime,
}: ExportDistributionProps) => {
    const { enqueueSnackbar } = useSnackbar();

    const [open, setOpen] = useState(false);
    const handleClose = () => setOpen(false);

    const [modalWidth, setModalWidth] = useState(
        window.innerWidth > 600 ? 400 : 300
    );
    useEffect(() => {
        const handleResize = () => {
            setModalWidth(window.innerWidth > 600 ? 400 : 300);
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);
    const style = {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: modalWidth,
        bgcolor: "background.paper",
        border: "2px solid #000",
        boxShadow: 24,
        p: 4,
    };

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
            setOpen(true);
            await sleep(1750);
            setOpen(false);

            try {
                const dataUrl = await toPng(distributionRef.current, {
                    cacheBust: true,
                    backgroundColor: "#fff",
                });

                if (isMobile) {
                    const res = await fetch(dataUrl);
                    const blob = await res.blob();
                    const file = new File(
                        [blob],
                        "letterboxd_distribution.png",
                        {
                            type: "image/png",
                        }
                    );

                    const canShareFile = navigator.canShare?.({
                        files: [file],
                    });

                    if (canShareFile) {
                        await navigator.share({
                            files: [file],
                            title: "Rating Distribution",
                        });
                    } else {
                        const link = document.createElement("a");
                        link.href = dataUrl;
                        link.download = "letterboxd_distribution.png";
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
                    link.download = "letterboxd_distribution.png";
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
                            https://recommendations.victorverma.com
                        </h1>
                        <h1 className="text-palette-darkbrown">
                            {generatedDatetime}
                        </h1>
                    </div>
                </div>
            )}

            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
                slotProps={{
                    backdrop: {
                        sx: {
                            backdropFilter: "blur(10px)",
                        },
                    },
                }}
            >
                <Box sx={style}>
                    <LinearIndeterminate />
                </Box>
            </Modal>

            <button
                onClick={handleDownloadDistribution}
                className="block mx-auto p-2 rounded-md hover:shadow-md bg-gray-200 hover:bg-palette-lightbrown"
            >
                {isMobile ? "Share Distribution" : "Download Distribution"}
            </button>
        </>
    );
};

export default ExportDistribution;
