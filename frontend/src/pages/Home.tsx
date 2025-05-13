import { Helmet } from "react-helmet-async";

import PageTitle from "../components/Layout/PageTitle";
import Recommendation from "../components/Recommendation";
import SquareAd from "../components/Ads/SquareAd";

const Home = () => {
    return (
        <div className="my-2">
            <Helmet>
                <title>Letterboxd Movie Recommendations</title>
                <link
                    rel="canonical"
                    href="https://www.recommendations.victorverma.com/"
                />
            </Helmet>

            <PageTitle title="Letterboxd Movie Recommendations" />

            <div className="mt-4 flex gap-4 justify-around">
                <div className="hidden md:flex grow">
                    <SquareAd />
                </div>
                <Recommendation />
                <div className="hidden md:flex grow">
                    <SquareAd />
                </div>
            </div>
        </div>
    );
};

export default Home;
