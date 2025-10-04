import { Outlet } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";

import CustomAlert from "./components/Alerts/CustomAlert";
import Footer from "./components/Layout/Footer";
import Header from "./components/Layout/Header";
import LetterboxdAlert from "./components/Alerts/LetterboxdAlert";

function Layout() {
    return (
        <>
            <Header />
            <div className="flex flex-col min-h-screen">
                <CustomAlert
                    severity="info"
                    message="Check out the new profile compatibility feature!"
                />
                <div className="grow">
                    <Outlet />
                </div>
                <LetterboxdAlert />
                <Footer />
                <Analytics />
            </div>
        </>
    );
}

export default Layout;
