import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";

import { PickType } from "../../types/WatchlistTypes";

interface PickInstructionsProps {
    pickType: PickType;
}

const PickInstructions = ({ pickType }: PickInstructionsProps) => {
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
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

    return (
        <div className="w-fit mx-auto">
            <div className="hidden w-128 my-8 md:flex md:flex-col space-y-4">
                {pickType == "random" ? (
                    <p>
                        Enter in a Letterboxd username to randomly select movies
                        from their watchlist.
                    </p>
                ) : (
                    <p>
                        Enter in a Letterboxd username to get personalized movie
                        recommendations from their watchlist.
                    </p>
                )}
                <p>
                    Enter in multiple usernames to consider movies across
                    multiple watchlists, and select the overlap option to only
                    consider movies in common across all user watchlists.
                </p>
            </div>
            <div className="md:hidden my-8 flex justify-center">
                <Button className="w-fit" onClick={handleOpen}>
                    Instructions
                </Button>
                <Modal
                    open={open}
                    onClose={handleClose}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Box sx={style}>
                        <div className="flex flex-col space-y-3 text-sm">
                            <Typography
                                id="modal-modal-title"
                                variant="h6"
                                component="h2"
                                className="text-palette-brown"
                            >
                                Instructions
                            </Typography>

                            {pickType == "random" ? (
                                <p>
                                    Enter in a Letterboxd username to randomly
                                    select movies from their watchlist.
                                </p>
                            ) : (
                                <p>
                                    Enter in a Letterboxd username to get
                                    personalized movie recommendations from
                                    their watchlist.
                                </p>
                            )}
                            <p>
                                Enter in multiple usernames to consider movies
                                across multiple watchlists, and select the
                                overlap option to only consider movies in common
                                across all user watchlists.
                            </p>
                        </div>
                    </Box>
                </Modal>
            </div>
        </div>
    );
};

export default PickInstructions;
