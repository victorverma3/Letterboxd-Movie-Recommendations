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
                    <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                        <p className="mt-4 text-sm">
                            <span className="underline">Popularity</span>:
                            Filters recommendations by movie popularity. 0
                            chooses from all movies, 2 chooses from the top 60%
                            most popular movies, and 4 chooses from the top 20%
                            most popular movies. Default value is 2.
                        </p>
                        <p className="mt-4 text-sm">
                            <span className="underline">Genres</span>: Filters
                            recommendations by genre. Default value is all
                            genres.
                        </p>
                    </Typography>
                </Box>
            </Modal>
        </div>
    );
};

export default FilterDefinitions;
