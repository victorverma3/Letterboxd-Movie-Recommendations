import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AiOutlineClose, AiOutlineMenu } from "react-icons/ai";
import { Drawer } from "@mui/material";

const Header = () => {
    const navItems = [
        { id: 1, text: "Recommendations", url: "/" },
        { id: 2, text: "Statistics", url: "/statistics" },
        { id: 3, text: "Watchlist", url: "/watchlist" },
        { id: 4, text: "FAQ", url: "/frequently-asked-questions" },
    ];

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
            if (window.innerWidth >= 640) {
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
                <div className="w-fit m-auto hidden sm:flex">
                    {navItems.map((item) => (
                        <p
                            key={item.id}
                            className="m-2 p-4 text-lg hover:text-palette-brown cursor-pointer transition duration-200"
                        >
                            <Link to={item.url}>{item.text}</Link>
                        </p>
                    ))}
                </div>
            </div>
            <div className="m-2 p-4 flex justify-start sm:hidden">
                <div
                    className="hover:text-palette-brown cursor-pointer"
                    onClick={() => setNavDrawerOpen(true)}
                >
                    <AiOutlineMenu size={24} />
                </div>

                <Drawer
                    anchor={"left"}
                    open={navDrawerOpen}
                    onClose={() => setNavDrawerOpen(false)}
                >
                    <div className="flex space-x-16">
                        <div className="m-2 px-2 py-4 space-y-4">
                            <div className="flex justify-between space-x-16">
                                <p
                                    className="w-48 my-auto px-2 m text-lg hover:text-palette-brown cursor-pointer transition duration-200"
                                    onClick={() => setNavDrawerOpen(false)}
                                >
                                    <Link to={"/"}>Recommendations</Link>
                                </p>
                                <div
                                    className="my-auto flex justify-end hover:text-palette-brown cursor-pointer rounded-full"
                                    onClick={() => setNavDrawerOpen(false)}
                                >
                                    <AiOutlineClose size={24} />
                                </div>
                            </div>
                            {navItems.slice(1).map((item) => (
                                <p
                                    key={item.id}
                                    className="w-48 px-2 text-lg hover:text-palette-brown cursor-pointer transition duration-200"
                                    onClick={() => setNavDrawerOpen(false)}
                                >
                                    <Link to={item.url}>{item.text}</Link>
                                </p>
                            ))}
                        </div>
                    </div>
                </Drawer>
            </div>
        </div>
    );
};

export default Header;
