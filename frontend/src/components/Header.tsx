import { useState } from "react";
import { Link } from "react-router-dom";
import { AiOutlineClose, AiOutlineMenu } from "react-icons/ai";

const Header = () => {
    const [nav, setNav] = useState(false);
    const [brand, setBrand] = useState(true);

    const handleNav = () => {
        setNav(!nav);
        setBrand(!brand);
    };

    const navItems = [
        { id: 1, text: "Home", url: "/" },
        { id: 2, text: "Statistics", url: "/statistics" },
        { id: 3, text: "Watchlist", url: "/watchlist" },
    ];

    return (
        <div className="mx-auto px-4 flex justify-between items-center max-w-[1240px]">
            {brand ? (
                <h1 className="w-full text-3xl text-amber-800 font-bold">
                    LMR
                </h1>
            ) : (
                <h1 className="w-full text-3xl text-white font-bold">LMR</h1>
            )}

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
                className={
                    nav
                        ? "w-3/5 h-full z-50 bg-white fixed sm:hidden top-0 left-0 ease-in-out duration-300"
                        : "w-3/5 h-full z-50 fixed top-0 bottom-0 left-[-100%] ease-in-out duration-300"
                }
            >
                <h1 className="w-full m-4 text-3xl font-bold text-amber-800">
                    LMR
                </h1>

                {navItems.map((item) => (
                    <Link onClick={handleNav} to={item.url}>
                        <li
                            key={item.id}
                            className="p-4 border-b hover:bg-amber-800 duration-300 hover:text-black cursor-pointer border-gray-600"
                        >
                            {item.text}
                        </li>
                    </Link>
                ))}
            </ul>
        </div>
    );
};

export default Header;
