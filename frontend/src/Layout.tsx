import { Outlet } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";

import Header from "./components/Layout/Header";
import Footer from "./components/Layout/Footer";
import CustomAlert from "./components/Alerts/CustomAlert";

function Layout() {
    return (
        <>
            <Header />
            <div className="flex flex-col min-h-screen">
                <CustomAlert
                    severity="error"
                    message="The site is currently experiencing technical difficulties. I am investigating and will try to fix it as soon as possible. Sorry for the inconvenience!"
                />
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
