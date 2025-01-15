// import CustomAlert from "../components/CustomAlert";
import Picks from "../components/Picks";

const Watchlist = () => {
    return (
        <div>
            <h1 className="w-96 max-w-full mx-auto mt-16 text-center text-4xl text-amber-800">
                Letterboxd Watchlist Picker
            </h1>

            {/* <CustomAlert severity="info" message="" /> */}

            <Picks />
        </div>
    );
};

export default Watchlist;
