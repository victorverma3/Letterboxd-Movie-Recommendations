const FrequentlyAskedQuestions = () => {
    return (
        <div className="my-2">
            <h1 className="w-96 max-w-full mx-auto mt-16 text-center text-4xl text-amber-800">
                Frequently Asked Questions
            </h1>

            <div className="w-4/5 sm:w-3/5 min-w-24 sm:min-w-96 mt-16 mx-auto flex flex-col">
                <h2 className="text-bold text-xl sm:text-2xl">General</h2>
                <h3 className="mt-4 text-bold sm:text-xl">
                    What is my Letterboxd username?
                </h3>
                <p className="mx-auto mt-4 text-justify sm:text-start text-xs sm:text-sm">
                    To use this website, it is required that you enter your
                    username (and not a custom profile display name). To view
                    your username on the Letterboxd app, click the "settings"
                    icon on the profile tab. At the top of the screen, it should
                    say signed in as _, which is your username. To view your
                    username on the Letterboxd website, navigate to the
                    "settings" page, and there should be a profile field titled
                    "Username".
                </p>
                <h3 className="mt-4 text-bold sm:text-xl">
                    Why am I getting an error, despite entering my username
                    correctly?
                </h3>
                <p className="mx-auto mt-4 text-justify sm:text-start text-xs sm:text-sm">
                    Users must have rated at least 5 movies on Letterboxd to
                    generate recommendations or calculate statistics for their
                    profile. If you are getting an error, this is most likely
                    the reason why. If you meet this rating threshold but are
                    still encountering a mysterious error, please report the bug
                    using the form at the bottom of the website.
                </p>
                <h3 className="mt-4 text-bold sm:text-xl">
                    How can I suggest a new feature, leave feedback, or report a
                    bug?
                </h3>
                <p className="mx-auto mt-4 text-justify sm:text-start text-xs sm:text-sm">
                    I am extremely receptive to feedback of any kind. At the
                    bottom of the site, I have linked a Google form through
                    which you can rate various aspects of my website, as well as
                    share suggestions, feedback, or bugs.
                </p>
                <h3 className="mt-4 text-bold sm:text-xl">
                    What was the inspiration for this website?
                </h3>
                <p className="mx-auto mt-4 text-justify sm:text-start text-xs sm:text-sm">
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
            <div className="w-4/5 sm:w-3/5 min-w-24 sm:min-w-96 mt-4 mx-auto flex flex-col">
                <h2 className="text-bold text-xl sm:text-2xl">
                    Recommendations
                </h2>
                <h3 className="mt-4 text-bold sm:text-xl">
                    How does the movie recommendation system work?
                </h3>
                <p className="mx-auto mt-4 text-justify sm:text-start text-xs sm:text-sm">
                    This website uses content-based filtering to recommend
                    movies to Letterboxd users based on their profile. After a
                    username is entered, the user's publicly accessible movie
                    ratings are scraped from the Letterboxd website. Next, each
                    movie's rating is merged with data detailing the
                    characteristics of that movie, which are also scraped from
                    the Letterboxd website and automatically updated every week.
                    The characteristics used by this model are the release year,
                    runtime, Letterboxd rating, Letterboxd rating count, country
                    of origin, and genres of the movie. After the relevant data
                    is gathered and formatted, a random forest model is trained
                    on the user's data. Finally, the trained model is used to
                    predict the movies that the user would rate the highest,
                    amongst those they have not already seen.
                </p>
            </div>
            <div className="w-4/5 sm:w-3/5 min-w-24 sm:min-w-96 mt-4 mx-auto flex flex-col">
                <h2 className="mt-4 text-bold text-xl sm:text-2xl">
                    Statistics
                </h2>
                <h3 className="mt-4 text-bold sm:text-xl">
                    How do you know that _ statistic is higher than _% of users?
                </h3>
                <p className="mx-auto mt-4 text-justify sm:text-start text-xs sm:text-sm">
                    Every time a user calculates their statistics, the latest
                    stats are recorded (or in the case of repeat users, updated)
                    in the database associated with this website. Your
                    statistics are being compared relative to all of the other
                    users' stats that already exist in the database. To ensure
                    accurate comparisons, the recorded stats are also
                    automatically updated on the 1st of every month.
                </p>
            </div>
            <div className="w-4/5 sm:w-3/5 min-w-24 sm:min-w-96 mt-4 mx-auto flex flex-col">
                <h2 className="mt-4 text-bold text-xl sm:text-2xl">
                    Watchlist
                </h2>
                <h3 className="mt-4 text-bold sm:text-xl"></h3>
                <p className="mx-auto mt-4 text-justify sm:text-start text-xs sm:text-sm"></p>
            </div>
        </div>
    );
};

export default FrequentlyAskedQuestions;
