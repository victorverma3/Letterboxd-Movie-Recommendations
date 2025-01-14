import { Outlet } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";

import Header from "./components/Header";
import Footer from "./components/Footer";

function Layout() {
    return (
        <>
            <Header />
            <div className="flex flex-col min-h-screen">
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
