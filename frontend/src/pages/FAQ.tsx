import { Helmet } from "react-helmet-async";

import FAQSection from "../components/FAQSection";
import PageTitle from "../components/Layout/PageTitle";

const generalFAQ = [
    {
        question: "What is my Letterboxd username?",
        answer: 'To use this website, it is required that you enter your username (and not a custom profile display name). To view your username on the Letterboxd app, click the "settings" icon on the profile tab. At the top of the screen, it should say signed in as _, which is your username. To view your username on the Letterboxd website, navigate to the "settings" page, and there should be a profile field titled "Username".',
    },
    {
        question:
            "Why am I getting an error, despite entering my username correctly?",
        answer: "Users must have rated at least 5 movies on Letterboxd to generate recommendations or calculate statistics for their profile. Additionally, this website will not work if the Letterboxd website is experiencing technical difficulties of its own. If the error persists, please report it using the form at the bottom of the website.",
    },
    {
        question:
            "How can I suggest a new feature, leave feedback, or report a bug?",
        answer: "I am extremely receptive to feedback of any kind. At the bottom of the site, I have linked two Google forms, one to submit suggestions, and the other to share feedback and bugs.",
    },
    {
        question: "What was the inspiration for this website?",
        answer: "I have enjoyed watching movies since I was a kid. The Letterboxd app is great to rate and compare movies with my friends, but it is missing a movie recommendation feature. A couple of years ago, I came across Sam Learner 's Letterboxd recommendation model, and I owe him a lot of credit for inspiring me to undertake this project. His model is really well made and uses collaborative-filtering and singular-value decomposition. One limitation, however, is that the collaborative filtering approach does not takes the chracteristics of a movie (release year, runtime, genre, etc) into account, and only focuses on user rating similarities. I thought that there was a lot of potential to create a content-based filtering recommendation model, and as a mathematics and computer science major, I thought that it would be really cool to make one myself. After spending 1.5 years taking the necessary coursework and developing supplementary skills, this website was born.",
    },
];

const recommendationsFAQ = [
    {
        question: "How does the movie recommendation system work?",
        answer: "This website uses content-based filtering to recommend movies to Letterboxd users based on their profile. After a username is entered, the user's publicly accessible movie ratings are scraped from the Letterboxd website. Next, each movie's rating is merged with data detailing the characteristics of that movie, which are also scraped from the Letterboxd website and automatically updated every week. The characteristics used by this model are the release year, runtime, Letterboxd rating, Letterboxd rating count, country of origin, and genres of the movie. After the relevant data is gathered and formatted, a random forest model is trained on the user's movie data. Finally, the trained model is used to predict the movies that the user would rate the highest, amongst those they have not already seen.",
    },
    {
        question:
            "Which movies are considered while generating recommendations?",
        answer: "The random forest model is only trained on movies that have been given a star rating by the user. Movies that the user has marked as watched but not rated will neither be used to train the model recommendations, nor suggested in the output. The recommender system does not take the user's watchlist into account - any overlap is coincidence (and probably a sign that you will like that movie).",
    },
];

const statisticsFAQ = [
    {
        question:
            "How do you know that _ statistic is higher than _% of users?",
        answer: "Every time a user calculates their statistics, their latest stats are recorded (or updated in the case of repeat users) in the database associated with this website. Your statistics are being compared relative to all of the other users' stats that already exist in the database. To ensure accurate comparisons, the recorded stats are also automatically updated on the 1st of every month.",
    },
];

const watchlistFAQ = [
    {
        question:
            "What is the difference between random movies and recommendations?",
        answer: "If the random movies setting is selected, the watchlist picks are chosen at random from the considered watchlist(s). if the recommendations setting is selected, the watchlist picks are chosen from the considered watchlist(s) in order of the highest predicted user rating.",
    },
];

const FrequentlyAskedQuestions = () => {
    return (
        <div className="my-2">
            <Helmet>
                <title>Frequently Asked Questions</title>
                <link
                    rel="canonical"
                    href="https://www.recommendations.victorverma.com/frequently-asked-questions"
                />
            </Helmet>

            <PageTitle title="Frequently Asked Questions" />

            <div className="flex flex-col space-y-4">
                <FAQSection title="General" items={generalFAQ} />

                <FAQSection
                    title="Recommendations"
                    items={recommendationsFAQ}
                />

                <FAQSection title="Statistics" items={statisticsFAQ} />

                <FAQSection title="Watchlist Picker" items={watchlistFAQ} />
            </div>
        </div>
    );
};

export default FrequentlyAskedQuestions;
