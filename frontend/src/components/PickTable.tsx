import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

type PickResponse = {
    title: string;
    url: string;
};

interface PickTableProps {
    picks: PickResponse[];
    width: number;
}

const PickTable = ({ picks, width }: PickTableProps) => {
    return (
        <TableContainer sx={{ width: width, maxHeight: 325 }} component={Paper}>
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
                                textAlign: "center",
                            }}
                        >
                            Title
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {picks.map((row) => (
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
                                    textAlign: "center",
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
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default PickTable;
