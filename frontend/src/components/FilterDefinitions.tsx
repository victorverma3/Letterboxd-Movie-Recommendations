import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";

const FilterDefinitions = () => {
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
                Filter Definitions
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
                        Filter Definitions
                    </Typography>
                    <p className="mt-4 text-sm">
                        <span className="underline text-amber-800">
                            Popularity
                        </span>
                        : Filters by popularity. 0 chooses from all movies, 2
                        chooses from the top 60% most popular movies, and 4
                        chooses from the top 20% most popular movies.
                    </p>
                    <p className="mt-4 text-sm">
                        <span className="underline text-amber-800">
                            Release Year
                        </span>
                        : Filters by movies that were released after the
                        specified year (inclusive).
                    </p>
                    <p className="mt-4 text-sm">
                        <span className="underline text-amber-800">Genres</span>
                        : Filters by genre. Movies can usually be recommended if
                        any of its genres are selected. Animation, documentary,
                        and horror genres will only be recommended if they are
                        selected.
                    </p>
                    <p className="mt-4 text-sm">
                        <span className="underline text-amber-800">
                            Runtime
                        </span>
                        : Filters by runtime. Short films are defined as 40
                        minutes or less.
                    </p>
                </Box>
            </Modal>
        </div>
    );
};

export default FilterDefinitions;
