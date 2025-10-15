import { Helmet } from "react-helmet-async";

import PageTitle from "../components/Layout/PageTitle";
import Recommendation from "../components/Recommendation";
import SquareAd from "../components/Ads/SquareAd";

import useIsScreenLg from "../hooks/useIsScreenLg";

const Home = () => {
    const isScreenLg = useIsScreenLg();

    return (
        <div className="my-2">
            <Helmet>
                <title>Letterboxd Movie Recommendations</title>
                <link
                    rel="canonical"
                    href="https://recommendations.victorverma.com/"
                />
            </Helmet>

            <PageTitle title="Letterboxd Movie Recommendations" />

            <div className="mt-4 flex gap-4 justify-around">
                {isScreenLg && (
                    <div className="w-[250px]">
                        <SquareAd />
                    </div>
                )}
                <Recommendation />
                {isScreenLg && (
                    <div className="w-[250px]">
                        <SquareAd />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
