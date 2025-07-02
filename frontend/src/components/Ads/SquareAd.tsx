import { useEffect, useRef } from "react";

const SquareAd = () => {
    const adRef = useRef<HTMLModElement>(null);

    useEffect(() => {
        const timeout = setTimeout(() => {
            const adEl = adRef.current;

            if (adEl && adEl.offsetWidth > 0 && window.adsbygoogle) {
                try {
                    window.adsbygoogle.push({});
                } catch (e) {
                    console.error("Adsbygoogle push error:", e);
                }
            } else {
                console.warn("Ad container not ready or has 0 width");
            }
        }, 100);

        return () => clearTimeout(timeout);
    }, []);

    return (
        <ins
            ref={adRef}
            className="adsbygoogle"
            style={{ display: "block" }}
            data-ad-client="ca-pub-4597068532012391"
            data-ad-slot="7300131826"
            data-ad-format="auto"
            data-full-width-responsive="true"
        />
    );
};

export default SquareAd;
