// import CustomAlert from "../components/CustomAlert";
import Recommendation from "../components/Recommendation";

const Home = () => {
    return (
        <div className="my-2">
            <h1 className="w-96 max-w-full mx-auto mt-16 text-center text-4xl">
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
            <hr className="mt-4" />
            <div className="w-4/5 sm:w-3/5 min-w-24 sm:min-w-96 mx-auto flex flex-col">
                <h2 className="mx-auto mt-4 text-amber-800 text-center text-xl sm:text-2xl">
                    Methodology
                </h2>
                <p className="mx-auto mt-4 text-justify sm:text-start text-xs sm:text-sm">
                    This model uses content-based filtering to recommend movies
                    to Letterboxd users based on their profile. After a username
                    is entered, the user's publicly accessible movie ratings are
                    scraped from the Letterboxd website. The user's ratings for
                    each movie are then merged with the comprehensive
                    characteristics of that movie, which are also scraped from
                    the Letterboxd website and automatically updated every week.
                    The characteristics used by this model are the release year,
                    runtime, Letterboxd rating, Letterboxd rating count, country
                    of origin, and genres of the movie. A random forest model is
                    trained on the user's data and then used to predict the
                    movies that the user would rate the highest from the stored
                    dataset of movies.
                </p>
            </div>
            <div className="w-4/5 sm:w-3/5 min-w-24 sm:min-w-96 mx-auto mt-4 flex flex-col">
                <h2 className="mx-auto text-amber-800 text-center text-xl sm:text-2xl">
                    Inspiration
                </h2>
                <p className="mx-auto mt-4 text-xs sm:text-sm">
                    I have enjoyed watching movies since I was a kid, and I love
                    using the Letterboxd app to rate and compare them with my
                    friends. The app is great, but the one thing missing is a
                    movie recommendation feature. A couple of years ago, I came
                    across{" "}
                    <a
                        className="underline decoration-amber-800 hover:text-amber-800 hover:shadow-md"
                        href="https://letterboxd.samlearner.com/"
                        target="_blank"
                    >
                        Sam Learner's Letterboxd recommendation model
                    </a>
                    , and I owe him a lot of credit for inspiring me to
                    undertake this project. His model is really well made and
                    uses collaborative-filtering and singular-value
                    decomposition. One limitation, however, is that the
                    collaborative filtering approach does not takes the
                    chracteristics of a movie (release year, runtime, genre,
                    etc) into account, and only focuses on user rating
                    similarities. I thought that there was a lot of potential to
                    create a content-based filtering recommendation model, and
                    as a mathematics and computer science major, I thought that
                    it would be really cool to make one myself. I picked up a
                    data science minor so that I could learn some more relevant
                    skills, and 1.5 years later this website was born.
                </p>
            </div>
        </div>
    );
};

export default Home;
