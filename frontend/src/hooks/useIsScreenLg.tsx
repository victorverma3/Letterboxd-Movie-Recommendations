import { useEffect, useState } from "react";

const useIsScreenLg = () => {
    const [isScreenLg, setIsScreenLg] = useState(false);

    useEffect(() => {
        const handler = () => setIsScreenLg(window.innerWidth >= 1024);
        handler();
        window.addEventListener("resize", handler);
        return () => window.removeEventListener("resize", handler);
    }, []);

    return isScreenLg;
};

export default useIsScreenLg;
