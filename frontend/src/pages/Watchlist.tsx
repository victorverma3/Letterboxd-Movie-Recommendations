import Maintenance from "../components/Maintenance";
import Picks from "../components/Picks";

const Watchlist = () => {
    return (
        <div>
            <h1 className="w-96 max-w-full mx-auto mt-16 text-center text-4xl">
                Letterboxd Watchlist Picker
            </h1>
            {false && (
                <div className="w-96 max-w-full mx-auto my-8">
                    <Maintenance
                        severity="warning"
                        message="The site is currently undergoing maintenance to increase optimization. Watchlist picker is temporarily disabled until 5/29. Sorry for the inconvenience!"
                    />
                </div>
            )}
            <Picks />
            <p className="mx-auto my-4 text-center">
                Follow my{" "}
                <a
                    className="underline decoration-amber-800 hover:text-amber-800 hover:shadow-md"
                    href="https://letterboxd.com/victorverma"
                    target="_blank"
                >
                    Letterboxd account
                </a>
                !
            </p>
        </div>
    );
};

export default Watchlist;
