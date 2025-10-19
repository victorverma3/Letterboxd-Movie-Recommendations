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
        const body = document.body;

        if (navDrawerOpen) {
            const scrollBarCompensation =
                window.innerWidth - document.documentElement.clientWidth;
            body.style.overflow = "hidden";
            if (scrollBarCompensation > 0) {
                body.style.paddingRight = `${scrollBarCompensation}px`;
            }
        } else {
            body.style.overflow = "";
            body.style.paddingRight = "";
        }

        return () => {
            body.style.overflow = "";
            body.style.paddingRight = "";
        };
    }, [navDrawerOpen]);

    return (
        <div
            className={`sticky top-0 z-[1500] h-16 ${
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
