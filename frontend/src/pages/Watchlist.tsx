import { Helmet } from "react-helmet-async";

import PageTitle from "../components/Layout/PageTitle";
import Picks from "../components/Picks";
import SquareAd from "../components/Ads/SquareAd";

import useIsScreenLg from "../hooks/useIsScreenLg";

const Watchlist = () => {
    const isScreenLg = useIsScreenLg();
    return (
        <div>
            <Helmet>
                <title>Letterboxd Watchlist Picker</title>
                <link
                    rel="canonical"
                    href="https://recommendations.victorverma.com/watchlist-picker"
                />
            </Helmet>

            <PageTitle title="Letterboxd Watchlist Picker" />

            <div className="mt-4 flex gap-4 justify-around">
                {isScreenLg && (
                    <div className="w-full">
                        <SquareAd />
                    </div>
                )}
                <Picks />
                {isScreenLg && (
                    <div className="w-full">
                        <SquareAd />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Watchlist;
