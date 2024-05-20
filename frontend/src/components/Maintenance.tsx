import Alert from "@mui/material/Alert";
import { AlertColor } from "@mui/material/Alert";

interface MaintenanceProps {
    severity: AlertColor;
    message: string;
}

const Maintenance = ({ severity, message }: MaintenanceProps) => {
    return (
        <div>
            <Alert severity={severity}>{message}</Alert>
        </div>
    );
};

export default Maintenance;
