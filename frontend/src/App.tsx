import { Routes, Route } from "react-router-dom";
import { SnackbarProvider } from "notistack";

import Layout from "./Layout";
import Home from "./pages/Home";
import Statistics from "./pages/Statistics";
import Watchlist from "./pages/Watchlist";
import FrequentlyAskedQuestions from "./pages/FAQ";
import Error from "./pages/Error";

import MovieFilterProvider from "./contexts/MovieFilterContext";

function App() {
    return (
        <div>
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
                        <Route path="/statistics" element={<Statistics />} />
                        <Route path="/watchlist" element={<Watchlist />} />
                        <Route
                            path="/frequently-asked-questions"
                            element={<FrequentlyAskedQuestions />}
                        />
                        <Route path="*" element={<Error />} />
                    </Route>
                </Routes>
            </SnackbarProvider>
        </div>
    );
}

export default App;
