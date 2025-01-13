import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AiOutlineClose, AiOutlineMenu } from "react-icons/ai";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

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
                setNavMenuAnchorEl(null);
            }
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const [navMenuAnchorEl, setNavMenuAnchorEl] = useState<null | HTMLElement>(
        null
    );
    const navMenuOpen = Boolean(navMenuAnchorEl);
    const handleNavMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setNavMenuAnchorEl(event.currentTarget);
    };
    const handleNavMenuClose = () => {
        setNavMenuAnchorEl(null);
    };

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
            <div className="m-2 p-4 flex justify-end sm:hidden">
                {navMenuOpen ? (
                    <span onClick={handleNavMenuClose}>
                        <AiOutlineClose size={28} />
                    </span>
                ) : (
                    <span onClick={handleNavMenuOpen}>
                        <AiOutlineMenu size={28} />
                    </span>
                )}
                <Menu
                    id="demo-positioned-menu"
                    aria-labelledby="demo-positioned-button"
                    anchorEl={navMenuAnchorEl}
                    open={navMenuOpen}
                    onClose={handleNavMenuClose}
                    anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "right",
                    }}
                    transformOrigin={{
                        vertical: "top",
                        horizontal: "right",
                    }}
                >
                    <MenuItem onClick={handleNavMenuClose}>
                        Recommendations
                    </MenuItem>
                    <MenuItem onClick={handleNavMenuClose}>Statistics</MenuItem>
                    <MenuItem onClick={handleNavMenuClose}>Watchlist</MenuItem>
                    <MenuItem onClick={handleNavMenuClose}>FAQ</MenuItem>
                </Menu>
            </div>
        </div>
    );
};

export default Header;
