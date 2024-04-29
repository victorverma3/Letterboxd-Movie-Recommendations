import { Outlet } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";

import Header from "./components/Header";
import Footer from "./components/Footer";

function Layout() {
    return (
        <div className="w-11/12 m-auto">
            <Header />
            <Outlet />
            <Footer />
            <Analytics />
        </div>
    );
}

export default Layout;
