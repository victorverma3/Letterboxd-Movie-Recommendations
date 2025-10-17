import { Routes, Route } from "react-router-dom";
import { SnackbarProvider } from "notistack";
import { HelmetProvider } from "react-helmet-async";

import Error from "./pages/Error";
import Layout from "./Layout";
import FAQ from "./pages/FAQ";
import Home from "./pages/Home";
import Metrics from "./pages/Metrics";
import ReleaseNotes from "./pages/ReleaseNotes";
import Compatibility from "./pages/Compatibility";
import Statistics from "./pages/Statistics";
import Watchlist from "./pages/Watchlist";

import CardViewProvider from "./contexts/CardViewContext";
import MovieFilterProvider from "./contexts/MovieFilterContext";

function App() {
    return (
        <div>
            <HelmetProvider>
                <SnackbarProvider>
                    <Routes>
                        <Route path="/" element={<Layout />}>
                            <Route
                                index
                                element={
                                    <MovieFilterProvider>
                                        <CardViewProvider>
                                            <Home />
                                        </CardViewProvider>
                                    </MovieFilterProvider>
                                }
                            />
                            <Route
                                path="/statistics"
                                element={<Statistics />}
                            />
                            <Route
                                path="/watchlist-picker"
                                element={
                                    <CardViewProvider>
                                        <Watchlist />
                                    </CardViewProvider>
                                }
                            />
                            <Route
                                path="/compatibility"
                                element={<Compatibility />}
                            />
                            <Route
                                path="/frequently-asked-questions"
                                element={<FAQ />}
                            />
                            <Route path="/metrics" element={<Metrics />} />
                            <Route
                                path="/release-notes"
                                element={<ReleaseNotes />}
                            />
                            <Route path="*" element={<Error />} />
                        </Route>
                    </Routes>
                </SnackbarProvider>
            </HelmetProvider>
        </div>
    );
}

export default App;
