import { Routes, Route } from "react-router-dom";
import { SnackbarProvider } from "notistack";
import { HelmetProvider } from "react-helmet-async";

import Error from "./pages/Error";
import Layout from "./Layout";
import FrequentlyAskedQuestions from "./pages/FAQ";
import Home from "./pages/Home";
import Metrics from "./pages/Metrics";
import Statistics from "./pages/Statistics";
import Watchlist from "./pages/Watchlist";

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
                                        <Home />
                                    </MovieFilterProvider>
                                }
                            />
                            <Route
                                path="/statistics"
                                element={<Statistics />}
                            />
                            <Route
                                path="/watchlist-picker"
                                element={<Watchlist />}
                            />
                            <Route
                                path="/frequently-asked-questions"
                                element={<FrequentlyAskedQuestions />}
                            />
                            <Route path="/metrics" element={<Metrics />} />
                            <Route path="*" element={<Error />} />
                        </Route>
                    </Routes>
                </SnackbarProvider>
            </HelmetProvider>
        </div>
    );
}

export default App;
