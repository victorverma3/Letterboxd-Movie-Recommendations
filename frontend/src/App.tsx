import { Routes, Route } from "react-router-dom";
import { SnackbarProvider } from "notistack";

import Layout from "./Layout";
import Home from "./pages/Home";
import Error from "./pages/Error";

function App() {
    return (
        <div>
            <SnackbarProvider>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<Home />} />
                        <Route path="*" element={<Error />} />
                    </Route>
                </Routes>
            </SnackbarProvider>
        </div>
    );
}

export default App;
