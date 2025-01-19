import { ReactNode } from "react";
import Alert from "@mui/material/Alert";
import { AlertColor } from "@mui/material/Alert";

interface CustomAlertProps {
    severity: AlertColor;
    message: ReactNode;
}

const CustomAlert = ({ severity, message }: CustomAlertProps) => {
    return (
        <div className="w-4/5 sm:w-3/5 max-w-fit mx-auto mt-8">
            <Alert severity={severity}>{message}</Alert>
        </div>
    );
};

export default CustomAlert;
