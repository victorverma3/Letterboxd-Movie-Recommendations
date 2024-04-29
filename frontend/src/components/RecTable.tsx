import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

type RecommendationResponse = {
    title: string;
    release_year: number;
    predicted_rating: number;
    url: string;
};

interface RecTableProps {
    recommendations: RecommendationResponse[];
}

const RecTable = ({ recommendations }: RecTableProps) => {
    return (
        <TableContainer sx={{ maxHeight: 325 }} component={Paper}>
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
                                color: "#A44200",
                            }}
                        >
                            Title
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: "bold",
                                fontFamily:
                                    "Verdana, Geneva, Tahoma, sans-serif",
                                color: "#A44200",
                            }}
                            align="right"
                        >
                            Release Year
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: "bold",
                                fontFamily:
                                    "Verdana, Geneva, Tahoma, sans-serif",
                                color: "#A44200",
                            }}
                            align="right"
                        >
                            Predicted Rating
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {recommendations.map((row) => (
                        <TableRow
                            key={row.url}
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
                                <a
                                    className="hover:underline hover:decoration-amber-800 hover:shadow-md transition duration-200"
                                    href={row.url}
                                    target="_blank"
                                >
                                    {row.title}
                                </a>
                            </TableCell>
                            <TableCell
                                sx={{
                                    fontFamily:
                                        "Verdana, Geneva, Tahoma, sans-serif",
                                }}
                                align="right"
                            >
                                {row.release_year}
                            </TableCell>
                            <TableCell
                                sx={{
                                    fontFamily:
                                        "Verdana, Geneva, Tahoma, sans-serif",
                                }}
                                align="right"
                            >
                                {row.predicted_rating}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default RecTable;
