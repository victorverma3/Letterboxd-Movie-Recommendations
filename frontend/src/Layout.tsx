import { Outlet } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";

function Layout() {
    return (
        <div className="w-11/12 m-auto">
            <Header />
            <Outlet />
            <Footer />
        </div>
    );
}

export default Layout;
