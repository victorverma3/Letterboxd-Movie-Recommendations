import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AiOutlineClose, AiOutlineMenu } from "react-icons/ai";

const Header = () => {
    const [nav, setNav] = useState(false);

    const handleNav = () => {
        setNav(!nav);
    };

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 640 && nav) {
                setNav(false);
            }
        };
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, [nav]);

    const navItems = [
        { id: 1, text: "Home", url: "/" },
        { id: 2, text: "Statistics", url: "/statistics" },
        { id: 3, text: "Watchlist", url: "/watchlist" },
    ];

    return (
        <div className="mx-auto px-4 flex justify-between items-center max-w-[1240px]">
            <h1 className="w-full text-3xl font-bold text-amber-800">
                <a href="/">LMR</a>
            </h1>
            <ul className="hidden sm:flex">
                {navItems.map((item) => (
                    <li
                        key={item.id}
                        className="m-2 p-4 text-xl text-black hover:text-amber-800 hover:underline rounded-xl cursor-pointer transition duration-200"
                    >
                        <Link to={item.url}>{item.text}</Link>
                    </li>
                ))}
            </ul>

            <div onClick={handleNav} className="m-2 p-4 block sm:hidden">
                {nav ? (
                    <AiOutlineClose size={28} />
                ) : (
                    <AiOutlineMenu size={28} />
                )}
            </div>

            <ul
                className={`w-3/6 h-full z-50 fixed top-0 bottom-0 ease-in-out duration-300 ${
                    nav ? "bg-white sm:hidden left-0" : "left-[-100%]"
                }`}
            >
                <li className="w-full m-4 text-3xl font-bold text-amber-800">
                    LMR
                </li>

                {navItems.map((item) => (
                    <li className="p-4 border-b hover:bg-amber-800 duration-300 hover:text-black cursor-pointer border-gray-600">
                        <Link
                            className="block w-full"
                            key={item.id}
                            onClick={handleNav}
                            to={item.url}
                        >
                            {item.text}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Header;
