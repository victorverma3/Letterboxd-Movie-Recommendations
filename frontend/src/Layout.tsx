import { Outlet } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";

import Header from "./components/Layout/Header";
import Footer from "./components/Layout/Footer";
// import CustomAlert from "./components/Alerts/CustomAlert";

function Layout() {
    return (
        <>
            <Header />
            <div className="flex flex-col min-h-screen">
                {/* <CustomAlert
                    severity="info"
                    message="Fixed bug with getting user ratings - site functionality restored."
                /> */}
                <div className="grow">
                    <Outlet />
                </div>
                <Footer />
                <Analytics />
            </div>
        </>
    );
}

export default Layout;
