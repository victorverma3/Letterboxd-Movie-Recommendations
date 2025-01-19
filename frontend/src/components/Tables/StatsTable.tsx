import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import { StatisticsResponse } from "../../types/StatisticsTypes";

interface StatsTableProps {
    statistics: StatisticsResponse;
}

const StatsTable = ({ statistics }: StatsTableProps) => {
    return (
        <TableContainer
            sx={{ width: "100%", margin: "auto" }}
            component={Paper}
        >
            <Table
                sx={{
                    width: "100%",
                    borderWidth: 1,
                    borderStyle: "solid",
                }}
                stickyHeader
                aria-label="simple table"
            >
                <TableHead>
                    <TableRow>
                        <TableCell
                            sx={{
                                fontWeight: "bold",
                                fontFamily:
                                    "Verdana, Geneva, Tahoma, sans-serif",
                                color: "#7f5539",
                            }}
                        >
                            Category
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: "bold",
                                fontFamily:
                                    "Verdana, Geneva, Tahoma, sans-serif",
                                color: "#7f5539",
                            }}
                        >
                            Mean
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: "bold",
                                fontFamily:
                                    "Verdana, Geneva, Tahoma, sans-serif",
                                color: "#7f5539",
                            }}
                            align="right"
                        >
                            Standard Deviation
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow
                        sx={{
                            "&:last-child td, &:last-child th": {
                                border: 0,
                            },
                        }}
                    >
                        <TableCell
                            sx={{
                                fontFamily:
                                    "Verdana, Geneva, Tahoma, sans-serif",
                            }}
                            component="th"
                            scope="row"
                        >
                            User Rating
                        </TableCell>
                        <TableCell
                            sx={{
                                fontFamily:
                                    "Verdana, Geneva, Tahoma, sans-serif",
                            }}
                            component="th"
                            scope="row"
                        >
                            {statistics.user_rating.mean}
                        </TableCell>
                        <TableCell
                            sx={{
                                fontFamily:
                                    "Verdana, Geneva, Tahoma, sans-serif",
                            }}
                            align="right"
                        >
                            {statistics.user_rating.std}
                        </TableCell>
                    </TableRow>
                    <TableRow
                        sx={{
                            "&:last-child td, &:last-child th": {
                                border: 0,
                            },
                        }}
                    >
                        <TableCell
                            sx={{
                                fontFamily:
                                    "Verdana, Geneva, Tahoma, sans-serif",
                            }}
                            component="th"
                            scope="row"
                        >
                            Letterboxd Rating
                        </TableCell>
                        <TableCell
                            sx={{
                                fontFamily:
                                    "Verdana, Geneva, Tahoma, sans-serif",
                            }}
                            component="th"
                            scope="row"
                        >
                            {statistics.letterboxd_rating.mean}
                        </TableCell>
                        <TableCell
                            sx={{
                                fontFamily:
                                    "Verdana, Geneva, Tahoma, sans-serif",
                            }}
                            align="right"
                        >
                            {statistics.letterboxd_rating.std}
                        </TableCell>
                    </TableRow>
                    <TableRow
                        sx={{
                            "&:last-child td, &:last-child th": {
                                border: 0,
                            },
                        }}
                    >
                        <TableCell
                            sx={{
                                fontFamily:
                                    "Verdana, Geneva, Tahoma, sans-serif",
                            }}
                            component="th"
                            scope="row"
                        >
                            Rating Differential
                        </TableCell>
                        <TableCell
                            sx={{
                                fontFamily:
                                    "Verdana, Geneva, Tahoma, sans-serif",
                            }}
                            component="th"
                            scope="row"
                        >
                            {statistics.rating_differential.mean}
                        </TableCell>
                        <TableCell
                            sx={{
                                fontFamily:
                                    "Verdana, Geneva, Tahoma, sans-serif",
                            }}
                            align="right"
                        >
                            N/A
                        </TableCell>
                    </TableRow>
                    <TableRow
                        sx={{
                            "&:last-child td, &:last-child th": {
                                border: 0,
                            },
                        }}
                    >
                        <TableCell
                            sx={{
                                fontFamily:
                                    "Verdana, Geneva, Tahoma, sans-serif",
                            }}
                            component="th"
                            scope="row"
                        >
                            Letterboxd Rating Count
                        </TableCell>
                        <TableCell
                            sx={{
                                fontFamily:
                                    "Verdana, Geneva, Tahoma, sans-serif",
                            }}
                            component="th"
                            scope="row"
                        >
                            {statistics.letterboxd_rating_count.mean}
                        </TableCell>
                        <TableCell
                            sx={{
                                fontFamily:
                                    "Verdana, Geneva, Tahoma, sans-serif",
                            }}
                            align="right"
                        >
                            N/A
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default StatsTable;
