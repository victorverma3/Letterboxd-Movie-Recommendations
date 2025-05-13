import { Helmet } from "react-helmet-async";

import PageTitle from "../components/Layout/PageTitle";
import Picks from "../components/Picks";
import SquareAd from "../components/Ads/SquareAd";

const Watchlist = () => {
    return (
        <div>
            <Helmet>
                <title>Letterboxd Watchlist Picker</title>
                <link
                    rel="canonical"
                    href="https://www.recommendations.victorverma.com/watchlist-picker"
                />
            </Helmet>

            <PageTitle title="Letterboxd Watchlist Picker" />

            <div className="mt-4 flex gap-4 justify-around">
                <div className="hidden md:flex grow">
                    <SquareAd />
                </div>
                <Picks />
                <div className="hidden md:flex grow">
                    <SquareAd />
                </div>
            </div>
        </div>
    );
};

export default Watchlist;
