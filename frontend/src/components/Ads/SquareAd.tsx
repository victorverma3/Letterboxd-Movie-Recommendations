import { useEffect } from "react";

const SquareAd = () => {
    useEffect(() => {
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.error("Adsbygoogle push error:", e);
        }
    }, []);

    return (
        <ins
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
