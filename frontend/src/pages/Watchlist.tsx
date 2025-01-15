// import CustomAlert from "../components/CustomAlert";
import PageTitle from "../components/PageTitle";
import Picks from "../components/Picks";

const Watchlist = () => {
    return (
        <div>
            <PageTitle title="Letterboxd Watchlist Picker" />

            {/* <CustomAlert severity="info" message="" /> */}

            <Picks />
        </div>
    );
};

export default Watchlist;
