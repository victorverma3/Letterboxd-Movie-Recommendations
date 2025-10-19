import { useEffect, useState } from "react";
import { AiOutlineClose, AiOutlineMenu } from "react-icons/ai";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import newtag from "../../images/newtag.png";

import useIsScreenLg from "../../hooks/useIsScreenLg";
import useIsScrolled from "../../hooks/useIsScrolled";

const navItems = [
    { text: "Recommendations", url: "/" },
    { text: "Statistics", url: "/statistics" },
    { text: "Watchlist Picker", url: "/watchlist-picker" },
    { text: "Compatibility", url: "/compatibility" },
    { text: "FAQ", url: "/frequently-asked-questions" },
    { text: "Metrics", url: "/metrics" },
];

const Header = () => {
    const isScreenLg = useIsScreenLg();
    const isScrolled = useIsScrolled();
    const [navDrawerOpen, setNavDrawerOpen] = useState(false);

    useEffect(() => {
        if (isScreenLg) {
            setNavDrawerOpen(false);
        }
    }, [isScreenLg]);

    useEffect(() => {
        if (navDrawerOpen) {
            document.body.style.overflowY = "scroll";
            document.body.style.position = "fixed";
            document.body.style.width = "100%";
        } else {
            document.body.style.overflowY = "";
            document.body.style.position = "";
            document.body.style.width = "";
        }

        return () => {
            document.body.style.overflowY = "";
            document.body.style.position = "";
            document.body.style.width = "";
        };
    }, [navDrawerOpen]);

    return (
        <div
            className={`sticky top-0 z-50 h-16 ${
                isScrolled && "shadow-md"
            } bg-white`}
        >
            {/* Navbar */}
            {isScreenLg && (
                <div className="h-full max-w-[1024px] m-auto flex items-center justify-evenly">
                    {navItems.map((item, index) => (
                        <Link
                            key={index}
                            className="relative p-4 text-lg hover:text-palette-brown cursor-pointer transition duration-200"
                            to={item.url}
                        >
                            {item.text}
                            {item.text === "Compatibility" && (
                                <img
                                    className="w-6 absolute top-3 right-0"
                                    src={newtag}
                                />
                            )}
                        </Link>
                    ))}
                </div>
            )}
            {!isScreenLg && (
                <div className="h-full flex items-center justify-end">
                    {navDrawerOpen ? (
                        <AiOutlineClose
                            className="mr-4 hover:cursor-pointer hover:text-palette-darkbrown"
                            size={32}
                            onClick={() => setNavDrawerOpen(false)}
                        />
                    ) : (
                        <AiOutlineMenu
                            className="mr-4 hover:cursor-pointer hover:text-palette-darkbrown"
                            size={32}
                            onClick={() => setNavDrawerOpen(true)}
                        />
                    )}
                </div>
            )}

            {/* Navbar Dropdown */}
            <AnimatePresence>
                {!isScreenLg && navDrawerOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "100vh", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden bg-white border-2 border-t border-gray-200"
                    >
                        <div className="flex flex-col items-start px-6 py-4 space-y-3">
                            {navItems.map((item) => (
                                <Link
                                    key={item.text}
                                    to={item.url}
                                    className="text-lg hover:text-palette-brown transition"
                                    onClick={() => setNavDrawerOpen(false)}
                                >
                                    {item.text}
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Header;
