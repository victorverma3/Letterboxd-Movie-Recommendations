import { CSVLink } from "react-csv";
import DownloadIcon from "@mui/icons-material/Download";
import { Tooltip } from "@mui/material";

import { RecommendationResponse } from "../../types/RecommendationsTypes";
import {
    PickRandomResponse,
    PickRecommendationResponse,
} from "../../types/WatchlistTypes";

interface ExportLetterboxdCSVProps {
    data:
        | RecommendationResponse[]
        | PickRandomResponse[]
        | PickRecommendationResponse;
    filename: string;
}

const ExportLetterboxdCSV = ({ data, filename }: ExportLetterboxdCSVProps) => {
    const formatCSV = (
        data:
            | RecommendationResponse[]
            | PickRandomResponse[]
            | PickRecommendationResponse
    ) => {
        const formattedData = [["url", "Title", "Year"]];

        const items = Array.isArray(data) ? data : [data];
        for (const item of items) {
            formattedData.push([
                "https://letterboxd.com" + item.url,
                item.title,
                item.release_year.toString(),
            ]);
        }

        return formattedData;
    };
    return (
        <div>
            <CSVLink data={formatCSV(data)} filename={filename}>
                <Tooltip title="Download">
                    <DownloadIcon className="text-palette-darkbrown" />
                </Tooltip>
            </CSVLink>
        </div>
    );
};

export default ExportLetterboxdCSV;
