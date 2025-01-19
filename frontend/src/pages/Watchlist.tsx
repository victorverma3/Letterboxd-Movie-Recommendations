import PageTitle from "../components/Layout/PageTitle";
import Picks from "../components/Picks";

const Watchlist = () => {
    return (
        <div>
            <PageTitle title="Letterboxd Watchlist Picker" />

            <Picks />
        </div>
    );
};

export default Watchlist;
