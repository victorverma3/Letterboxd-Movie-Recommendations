import { useEffect, useState } from "react";

const useIsScreenSm = () => {
    const [isScreenSm, setIsScreenSm] = useState(false);

    useEffect(() => {
        const handler = () => setIsScreenSm(window.innerWidth >= 640);
        handler();
        window.addEventListener("resize", handler);
        return () => window.removeEventListener("resize", handler);
    }, []);

    return isScreenSm;
};

export default useIsScreenSm;
