import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import IconButton from "@mui/material/IconButton";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";

interface DefinitionModalProps {
    title: string;
    definition: string;
}

const DefinitionModal = ({ title, definition }: DefinitionModalProps) => {
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
        <div className="w-fit">
            <IconButton onClick={handleOpen}>
                <HelpOutlineIcon color="primary" fontSize="small" />
            </IconButton>

            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style} className="flex flex-col space-y-3">
                    <Typography
                        className="text-palette-brown"
                        variant="h6"
                        component="h2"
                    >
                        {title}
                    </Typography>
                    <Typography>{definition}</Typography>
                </Box>
            </Modal>
        </div>
    );
};

export default DefinitionModal;
