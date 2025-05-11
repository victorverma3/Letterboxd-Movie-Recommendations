import { Helmet } from "react-helmet-async";

import PageTitle from "../components/Layout/PageTitle";
import Picks from "../components/Picks";

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

            <Picks />
        </div>
    );
};

export default Watchlist;
