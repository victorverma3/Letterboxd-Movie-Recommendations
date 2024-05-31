import { useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Paper from "@mui/material/Paper";

type GenreAverage = {
    mean_rating_differential: number;
    mean_user_rating: number;
};

type GenreStatsResponse = {
    action: GenreAverage;
    adventure: GenreAverage;
    animation: GenreAverage;
    comedy: GenreAverage;
    crime: GenreAverage;
    documentary: GenreAverage;
    drama: GenreAverage;
    family: GenreAverage;
    fantasy: GenreAverage;
    history: GenreAverage;
    horror: GenreAverage;
    music: GenreAverage;
    mystery: GenreAverage;
    romance: GenreAverage;
    science_fiction: GenreAverage;
    thriller: GenreAverage;
    tv_movie: GenreAverage;
    war: GenreAverage;
    western: GenreAverage;
};

interface GenreStatsTableProps {
    statistics: GenreStatsResponse;
}

type DataType = GenreAverage & { genre: string };

const GenreStatsTable = ({ statistics }: GenreStatsTableProps) => {
    const toTitleCase = (s: string) => {
        if (s === "tv_movie") {
            return "TV Movie";
        } else {
            return s
                .split("_")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ");
        }
    };

    const [order, setOrder] = useState<"asc" | "desc">("asc");
    const [orderBy, setOrderBy] = useState<keyof GenreAverage | "genre">(
        "genre"
    );
    const initialData = Object.entries(statistics).map(([genre, stats]) => ({
        genre,
        ...stats,
    }));
    const [data, setData] = useState<DataType[]>(initialData);

    const handleRequestSort = (property: keyof GenreAverage | "genre") => {
        let isAsc = orderBy === property && order === "asc";
        setOrder(isAsc ? "desc" : "asc");
        setOrderBy(property);
        if (property === "genre") {
            isAsc = !isAsc;
        }
        const sortedData = [...data].sort((a, b) => {
            if (a[property] < b[property]) {
                return isAsc ? -1 : 1;
            }
            if (a[property] > b[property]) {
                return isAsc ? 1 : -1;
            }
            return 0;
        });
        setData(sortedData);
    };

    return (
        <div>
            <TableContainer sx={{ maxHeight: 400 }} component={Paper}>
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
                                sortDirection={
                                    orderBy === "genre" ? order : false
                                }
                                sx={{
                                    fontWeight: "bold",
                                    fontFamily:
                                        "Verdana, Geneva, Tahoma, sans-serif",
                                    color: "#A44200",
                                }}
                            >
                                <TableSortLabel
                                    active={orderBy === "genre"}
                                    direction={
                                        orderBy === "genre" ? order : "asc"
                                    }
                                    onClick={() => handleRequestSort("genre")}
                                >
                                    Genre
                                </TableSortLabel>
                            </TableCell>
                            <TableCell
                                sortDirection={
                                    orderBy === "mean_user_rating"
                                        ? order
                                        : false
                                }
                                sx={{
                                    fontWeight: "bold",
                                    fontFamily:
                                        "Verdana, Geneva, Tahoma, sans-serif",
                                    color: "#A44200",
                                }}
                                align="center"
                            >
                                <TableSortLabel
                                    active={orderBy === "mean_user_rating"}
                                    direction={
                                        orderBy === "mean_user_rating"
                                            ? order
                                            : "asc"
                                    }
                                    onClick={() =>
                                        handleRequestSort("mean_user_rating")
                                    }
                                >
                                    Mean User Rating
                                </TableSortLabel>
                            </TableCell>
                            <TableCell
                                sortDirection={
                                    orderBy === "mean_rating_differential"
                                        ? order
                                        : false
                                }
                                sx={{
                                    fontWeight: "bold",
                                    fontFamily:
                                        "Verdana, Geneva, Tahoma, sans-serif",
                                    color: "#A44200",
                                }}
                                align="center"
                            >
                                <TableSortLabel
                                    active={
                                        orderBy === "mean_rating_differential"
                                    }
                                    direction={
                                        orderBy === "mean_rating_differential"
                                            ? order
                                            : "asc"
                                    }
                                    onClick={() =>
                                        handleRequestSort(
                                            "mean_rating_differential"
                                        )
                                    }
                                >
                                    Mean Rating Diff
                                </TableSortLabel>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map(
                            ({
                                genre,
                                mean_user_rating,
                                mean_rating_differential,
                            }) => (
                                <TableRow
                                    key={genre}
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
                                        {toTitleCase(genre)}
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            fontFamily:
                                                "Verdana, Geneva, Tahoma, sans-serif",
                                        }}
                                        component="th"
                                        scope="row"
                                        align="center"
                                    >
                                        {mean_user_rating}
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            fontFamily:
                                                "Verdana, Geneva, Tahoma, sans-serif",
                                        }}
                                        align="center"
                                    >
                                        {mean_rating_differential}
                                    </TableCell>
                                </TableRow>
                            )
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};

export default GenreStatsTable;
