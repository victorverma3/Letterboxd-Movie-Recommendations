import Recommendation from "../components/Recommendation";

const Home = () => {
    return (
        <div className="my-2">
            <h1 className="w-96 mx-auto mt-16 text-center text-4xl">
                Letterboxd Movie Recommendations
            </h1>
            <div className="mt-4">
                <Recommendation />
            </div>
            <h2 className="w-fit mx-auto mt-4 text-center text-2xl">
                Methodology
            </h2>
            <p className="w-3/6 min-w-96 mx-auto mt-4 text-sm"></p>
            <h2 className="w-fit mx-auto mt-4 text-center text-2xl">
                Inspiration
            </h2>
            <p className="w-3/6 min-w-96 mx-auto mt-4 text-sm">
                I have enjoyed watching movies since I was a kid, and I
                naturally loved using the Letterboxd app to rate them and
                compare with my friends. Letterboxd is a great app, but the one
                thing missing is a movie recommendation feature. A couple of
                years ago, I came across{" "}
                <a
                    className="underline"
                    href="https://letterboxd.samlearner.com/"
                    target="_blank"
                >
                    this
                </a>{" "}
                Letterboxd recommendation model created by Sam Learner, which
                uses collaborative-filtering and singular-value decomposition.
                The model is really well made, but the collaborative filtering
                approach is limited because it does not takes the chracteristics
                of a movie (release year, runtime, genre, etc) into account, and
                only focuses on user rating similarities. I thought that there
                was a lot of potential to create a content-based filtering
                recommendation model, and as a mathematics and computer science
                major, I thought that it would be really cool to make one
                myself. I picked up a data science minor so that I could learn
                some more relevant skills, and 1.5 years later, this model was
                born.
            </p>
        </div>
    );
};

export default Home;
