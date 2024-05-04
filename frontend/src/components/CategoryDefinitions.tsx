import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";

const CategoryDefinitions = () => {
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
        <div className="w-4/5 sm:w-5/8 min-w-24 sm:min-w-96 mx-auto mt-4 flex flex-col items-center">
            <Button className="w-fit" onClick={handleOpen}>
                Category Definitions
            </Button>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Typography
                        id="modal-modal-title"
                        variant="h6"
                        component="h2"
                    >
                        Category Definitions
                    </Typography>
                    <p className="mt-4 text-sm">
                        <span className="underline text-amber-800">
                            Mean User Rating
                        </span>
                        : The average rating the user gives to a movie on
                        Letterboxd.
                    </p>
                    <p className="mt-4 text-sm">
                        <span className="underline text-amber-800">
                            Mean Letterboxd Rating
                        </span>
                        : The average Letterboxd community rating of movies that
                        the user has rated.
                    </p>
                    <p className="mt-4 text-sm">
                        <span className="underline text-amber-800">
                            Mean Rating Differential
                        </span>
                        : The average difference between the user's rating and
                        the Letterboxd community rating on a movie.
                    </p>
                    <p className="mt-4 text-sm">
                        <span className="underline text-amber-800">
                            Mean Letterboxd Rating Count
                        </span>
                        : The average number of Letterboxd community ratings
                        across the movies the user has rated.
                    </p>
                </Box>
            </Modal>
        </div>
    );
};

export default CategoryDefinitions;
