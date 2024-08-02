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
            <p className="mx-auto mt-12 text-center">
                Follow me on{" "}
                <a
                    className="underline decoration-amber-800 hover:text-amber-800 hover:shadow-md"
                    href="https://letterboxd.com/victorverma"
                    target="_blank"
                >
                    Letterboxd
                </a>
                !
            </p>
        </div>
    );
};

export default Watchlist;
