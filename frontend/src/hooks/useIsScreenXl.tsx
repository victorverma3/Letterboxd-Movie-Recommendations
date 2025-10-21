import { useEffect, useState } from "react";

const useIsScreenXl = () => {
    const [isScreenXl, setIsScreenXl] = useState(false);

    useEffect(() => {
        const handler = () => setIsScreenXl(window.innerWidth >= 1280);
        handler();
        window.addEventListener("resize", handler);
        return () => window.removeEventListener("resize", handler);
    }, []);

    return isScreenXl;
};

export default useIsScreenXl;
