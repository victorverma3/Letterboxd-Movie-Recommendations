import CustomAlert from "../components/CustomAlert";
import Picks from "../components/Picks";

const Watchlist = () => {
    return (
        <div>
            <h1 className="w-96 max-w-full mx-auto mt-16 text-center text-4xl">
                Letterboxd Watchlist Picker
            </h1>

            <CustomAlert
                severity="info"
                message={
                    <span>
                        Consider filling out this{" "}
                        <a
                            className="underline"
                            href="https://docs.google.com/forms/d/e/1FAIpQLSdRETeDzFE_i6lSv6BunfmSHCdINK5YQKoFAV_8nwog1-A9Qg/viewform?usp=sf_link"
                            target="_blank"
                        >
                            survey
                        </a>{" "}
                        about the site!
                    </span>
                }
            />

            <Picks />
            <p className="mx-auto mt-12 mb-4 text-center">
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
