# Letterboxd-Movie-Recommendations

Generate AI-powered movie recommendations, discover insightful profile
statistics, pick movies from your watchlist, and see your film compatibility
with friends, all using just your Letterboxd username.

[www.recommendations.victorverma.com](https://www.recommendations.victorverma.com/)

## Table of Contents

-   [Sitemap](#sitemap)
-   [Technologies](#technologies)
-   [Core Features](#core-features)
    -   [Recommendations](#recommendations)
        -   [Architecture](#architecture)
        -   [Movie Data Collection](#movie-data-collection)
        -   [User Rating Collection](#user-rating-collection)
        -   [Personalized Recommendation Model](#personalized-recommendation-model)
        -   [Recommendation Filters](#recommendation-filters)
        -   [Multi-User Recommendations](#multi-user-recommendations)
        -   [Predictions](#predictions)
    -   [Statistics](#statistics)
        -   [Basic Statistics](#basic-statistics)
        -   [Genre Statistics](#genre-statistics)
        -   [User Rating Distribution](#user-rating-distribution)
    -   [Watchlist Picker](#watchlist-picker)
        -   [Multi-User Watchlist Picks](#multi-user-watchlist-picks)
    -   [Profile Compatibility](#profile-compatibility)
-   [Inspiration](#inspiration)
-   [Limitations](#limitations)

## Sitemap

```
root
|_ Recommendations
|_ Statistics
|_ Watchlist Picker
|_ FAQ
|_ Metrics
|_ Release Notes
```

## Technologies

-   Frontend:
    -   `React`, `TypeScript`, `Tailwind CSS`.
-   Backend:
    -   `Flask`, `Python`, `Supabase` (postgreSQL), `Redis`, `MongoDB`.
-   Infrastructure:
    -   `Vercel` (frontend), `Amazon Lightsail` (backend).
-   Tools:
    -   `GitHub Actions`.

## Core Features

### Recommendations

The user inputs their Letterboxd username and the website generates movie
recommendations based on their Letterboxd profile.

#### Architecture

The underlying principle is `content-based filtering`, which infers a rating
based on the characteristics of the movie. An alternative approach is
`collaborative filtering`, which infers a rating based on rating patterns across
users without explicit movie characteristics. The former was selected over the
latter so that a user's recommendations are only based upon their own Letterboxd
profile. The architecture might someday be changed to the `two-tower`
recommender system, which is a combination of the previous two.

#### Movie Data Collection

The URLs for the Letterboxd pages of 100,000+ movies are stored in the database.
To reduce client latency, the data from these movies is asychronously scraped
once per month through a scheduled GitHub Action.

The following features are stored as a table in the database:

-   `movie_id`,
-   `url`,
-   `title`,
-   `release_year`,
-   `runtime`,
-   `genres`,
-   `country_of_origin`,
-   `content_type`,
-   `letterboxd_rating`,
-   `letterboxd_rating_count`,
-   `poster`.

The movie data is stored in LRU cache on the `Flask` server to improve
end-to-end latency.

#### User Rating Collection

When the user inputs their username, their Letterboxd ratings are scraped from
their profile. The following features are aggregated:

-   `movie_id`,
-   `user_rating`,
-   `liked`,
-   `url`,
-   `username`.

Currently, the `liked` feature is not in use. While processing a request, the
scraped user ratings are merged with the movie data on the key `(movie_id, url)`
to generate personalized recommendations. The merged data for a user is cached
in `Redis` for an hour at a time, reducing the latency of subsequent requests by
up to 10x. The Letterboxd URLs of the movies scraped from the user's profile are
also upserted into the existing movie url table. This allows for organic growth
in the number of movies whose data is scraped each week.

Once per month, the latest Letterboxd ratings of all users are scraped and
stored in the database (excluding the `url` feature), totaling over 1 million
ratings. This is used to train the general recommendation model.

#### Personalized Recommendation Model

When a user inputs their username, the stored movie data is read from the
database. This is merged with the user ratings on the key `(movie_id, url)` to
create the data used to train the machine learning model.

The training features are

-   `release_year (int)`,
-   `runtime (int)`,
-   `genres (int)`,
-   `country_of_origin (int)`,
-   `letterboxd_rating (float)`,
-   `letterboxd_rating_count (int)`,
-   `is_action (int)`,
-   `is_adventure (int)`,
-   `is_animation (int)`,
-   `is_comedy (int)`,
-   `is_crime (int)`,
-   `is_documentary (int)`,
-   `is_drama (int)`,
-   `is_family (int)`,
-   `is_fantasy (int)`,
-   `is_history (int)`,
-   `is_horror (int)`,
-   `is_music (int)`,
-   `is_mystery (int)`,
-   `is_romance (int)`,
-   `is_science_fiction (int)`,
-   `is_tv_movie (int)`,
-   `is_thriller (int)`,
-   `is_war (int)`,
-   `is_western (int)`,
-   `is_movie (int)`.

The target feature is `user_rating (float)`.

A new random forest model is trained each time the user inputs their username.
This introduces additional variability across users, but allows for the model
predictions to be based solely upon the current user's rating habits.

#### Recommendation Filters

There are two ways that the user can filter the characteristics of the generated
movie recommendations. By default, the user can manually configure the filters,
which allows for the most granular control over the results. Another option is
for the user to describe what they want to watch using natural language, which
is then processed using OpenAI's GPT-5 Nano to produce filters that match the
user's description.

#### Multi-User Recommendations

Since people often watch movies in a group setting, functionality was added to
support multi-user recommendations. When multiple usernames are input,
recommendations are initially generated for each user following the normal
procedure. Next, the recommendations are filtered to only keep movies that are
recommended for all users. Then, each user's predicted ratings are averaged for
each of the overlapping recommendations. Finally, the recommendations are
resorted based on the average predicted rating and output to the users.

#### Predictions

When the prediction option is selected, the user can input specific Letterboxd
URLs alongside their username. These are fed into the personalized
recommendation model, and the user is able to see the predicted rating for any
movie they choose (as long as the movie data exists in the database). Since the
movie data is updated monthly, the predicted ratings for the latest movies may
not be immediately available.

### Statistics

The user inputs their Letterboxd username and the website calculates statistics
based on their Letterboxd profile.

#### Basic Statistics

There are four basic statistics:

-   `User Rating`: the rating the user gives to a movie on Letterboxd,
-   `Letterboxd Rating`: the Letterboxd community rating of a movie the user has
    rated,
-   `Rating Differential`: the difference between the user's rating and the
    Letterboxd community rating of a movie,
-   `Letterboxd Rating Count`: the number of Letterboxd community ratings for a
    movie the user has rated.

The user can see the average and standard deviation of each basic statistic
based on their profile, as well as the percentiles of their statistics relative
to other website users. The `Movie Rating Style` is established based on the
user's percentile for the `Rating Differential`, and the `Obscurity Rating` is
determined based on their percentile for the `Letterboxd Rating Count`.

#### Genre Statistics

For each genre, the user can see both their average `User Rating` and their
average `Rating Differential`. The former lets the user learn which genres they
rate highest and lowest, and the latter lets the user discover which genres they
love or hate the most relative to the Letterboxd community as a whole.

#### User Rating Distribution

First, the user's ratings are scraped from their profile and used to create a
histogram portraying the distribution. Then, a line chart visualizing the
density of Letterboxd ratings for the same movies is overlayed, allowing the
user to visualize their movie rating patterns within the context of the
Letterboxd community.

### Watchlist Picker

The user inputs their Letterboxd username and the website picks movies from
their Letterboxd watchlist. If the `random` option is chosen, then the picks are
made at random. If the `recommendations` option is selected, then the watchlist
picks are presented in order by which movie is predicted to be rated the
highest, using the same model as the movie recommendations.

#### Multi-User Watchlist Picks

Since people often watch movies in a group setting, functionality was also added
to support multi-user watchlist picks. If the `overlap` option is toggled, then
the watchlist pool is the intersection of all user watchlists. If the `overlap`
option is not selected, then the watchlist pool is the union of all user
watchlists. For the `random` option, the picks are still made at random from the
watchlist pool. For the `recommendations` option, when multiple usernames are
input, recommendations are initially generated for each user following the
normal procedure. Next, the recommendations are filtered to only keep movies
that are recommended for all users. Then, each user's predicted ratings are
averaged for each of the overlapping recommendations. Finally, the
recommendations are resorted based on the average predicted rating and output to
the users.

### Profile Compatibility

The user inputs two Letterboxd usernames and the website calculates the film
compatibility score of the two Letterboxd profiles. The score is calculated by
looking at the similarity between the rating patterns of the two users. If they
tend to similarly rate movies with similar characteristics, their film
compatibility score will be higher.

First, each user's Letterboxd ratings are scraped from their profile. Next, a
ridge regression model is trained on each set of ratings, and a "preference
vector" is learned for each user. Essentially, a user's preference vector is a
numerical value describing the contribution of each movie characteristic to the
user's rating of a movie. Both preference vectors are normalized, and the cosine
similarity of the two vectors is calculated. The output is scaled from the range
[-1, 1] to [0, 100]. A score of 0 indicates maximum incompatibility between the
two users, while a score of 100 signifies perfect compatibility.

Profiles with more ratings are expected to be compared more accurately because
their preference vectors will be trained on more data.

## Inspiration

I have enjoyed watching movies since I was a kid, and I love using the
Letterboxd app to log movies and compare ratings with my friends. Unfortunately,
the app has no built-in recommendation feature, a glaring omission for people
trying to figure out what they should watch next. A couple of years ago, I came
across Sam Learner's Letterboxd recommendation model, and I owe him a lot of
credit for inspiring me to undertake this project. His model is really well made
and uses collaborative-filtering and singular-value decomposition. One
limitation, however, is that the collaborative filtering approach does not take
the chracteristics of a movie (release year, runtime, genre, etc) into account,
and only focuses on user rating similarities. I saw a niche market for a
content-based filtering recommendation model based entirely on movie metadata,
and as a mathematics and computer science major, I thought that it would be
really cool to make one myself. The initial groundwork for the project started
in 2023, and v1.0.0 of the website came online in April 2024.

## Limitations

The limitations of this project are mostly due to financial constraints.

-   I am using the `Supabase` free tier, which only allows for 500 MB of storage
    and 5 GB of egress per month. Therefore, I have to be extremely efficient
    with what data I choose to store, as well as how often I choose to retrieve
    it. Besides improving latency, `Redis` also helped in reducing my database
    egress.
-   I am paying $7 per month to deploy my backend server on `Amazon Lightsail`,
    which has one instance with a limit of 1 GB RAM and 2 vCPUs. Large volumes
    of concurrent server traffic occasionally cause my server to exceed the
    memory limit and crash.
