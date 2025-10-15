import { useEffect, useState } from "react";

const useIsScreenMd = () => {
    const [isScreenMd, setIsScreenMd] = useState(false);

    useEffect(() => {
        const handler = () => setIsScreenMd(window.innerWidth >= 1024);
        handler();
        window.addEventListener("resize", handler);
        return () => window.removeEventListener("resize", handler);
    }, []);

    return isScreenMd;
};

export default useIsScreenMd;
