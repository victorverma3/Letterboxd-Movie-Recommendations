// import CustomAlert from "../components/CustomAlert";
import Recommendation from "../components/Recommendation";

const Home = () => {
    return (
        <div className="my-2">
            <h1 className="w-96 max-w-full mx-auto mt-16 text-center text-4xl text-amber-800">
                Letterboxd Movie Recommendations
            </h1>

            {/* <CustomAlert severity="info" message="" /> */}

            <div className="mt-4">
                <Recommendation />
            </div>
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

export default Home;
