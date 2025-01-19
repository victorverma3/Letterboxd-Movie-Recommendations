import PageTitle from "../components/Layout/PageTitle";
import Recommendation from "../components/Recommendation";

const Home = () => {
    return (
        <div className="my-2">
            <PageTitle title="Letterboxd Movie Recommendations" />

            <div className="mt-4">
                <Recommendation />
            </div>
        </div>
    );
};

export default Home;
