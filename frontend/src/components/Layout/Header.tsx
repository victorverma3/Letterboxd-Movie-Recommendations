import { useState, useEffect } from "react";
import { AiOutlineClose, AiOutlineMenu } from "react-icons/ai";
import { Drawer } from "@mui/material";
import { Link } from "react-router-dom";

const navItems = [
    { text: "Recommendations", url: "/" },
    { text: "Statistics", url: "/statistics" },
    { text: "Watchlist Picker", url: "/watchlist-picker" },
    { text: "FAQ", url: "/frequently-asked-questions" },
    { text: "Metrics", url: "/metrics" },
];

const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setNavDrawerOpen(false);
            }
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const [navDrawerOpen, setNavDrawerOpen] = useState(false);

    return (
        <div
            className={`sticky top-0 z-50 bg-white ${
                isScrolled && "shadow-md"
            }`}
        >
            <div className="hidden sm:flex">
                <div className="w-fit m-auto hidden md:flex">
                    {navItems.map((item, index) => (
                        <Link
                            key={index}
                            className="m-2 p-4 text-lg hover:text-palette-brown cursor-pointer transition duration-200"
                            to={item.url}
                        >
                            {item.text}
                        </Link>
                    ))}
                </div>
            </div>
            <div className="m-2 p-4 flex justify-end md:hidden">
                <div
                    className="hover:text-palette-brown cursor-pointer"
                    onClick={() => setNavDrawerOpen(true)}
                >
                    <AiOutlineMenu size={24} />
                </div>

                <Drawer
                    anchor={"right"}
                    open={navDrawerOpen}
                    onClose={() => setNavDrawerOpen(false)}
                >
                    <div className="flex space-x-16">
                        <div className="m-2 px-2 py-4 space-y-4 flex flex-col">
                            <div className="flex justify-between space-x-16">
                                <div
                                    className="my-auto flex justify-end hover:text-palette-brown cursor-pointer rounded-full"
                                    onClick={() => setNavDrawerOpen(false)}
                                >
                                    <AiOutlineClose size={24} />
                                </div>
                                <Link
                                    className="w-48 my-auto px-2 text-lg text-end hover:text-palette-brown cursor-pointer transition duration-200"
                                    onClick={() => setNavDrawerOpen(false)}
                                    to={"/"}
                                >
                                    Recommendations
                                </Link>
                            </div>
                            {navItems.slice(1).map((item, index) => (
                                <Link
                                    key={index}
                                    className="w-48 ml-auto px-2 text-lg text-end hover:text-palette-brown cursor-pointer transition duration-200"
                                    onClick={() => setNavDrawerOpen(false)}
                                    to={item.url}
                                >
                                    {item.text}
                                </Link>
                            ))}
                        </div>
                    </div>
                </Drawer>
            </div>
        </div>
    );
};

export default Header;
