import Recommendation from "../components/Recommendation";
import PageTitle from "../components/PageTitle";

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
