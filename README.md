# Letterboxd-Movie-Recommendations

Generate AI-powered movie recommendations, discover unique profile statistics,
and pick movies from your watchlist, all with just your Letterboxd username.

[www.recommendations.victorverma.com](https://www.recommendations.victorverma.com/)

## Table of Contents

-   [Sitemap](#sitemap)
-   [Technologies](#technologies)
-   [Core Features](#core-features)
    -   [Recommendations](#recommendations)
        -   [Architecture](#architecture)
        -   [Movie Data Collection](#movie-data-collection)
        -   [User Rating Collection](#user-rating-collection)
        -   [Recommendation Model](#recommendation-model)
        -   [Multi-User Recommendations](#multi-user-recommendations)
    -   [Statistics](#statistics)
        -   [Basic Statistics](#basic-statistics)
        -   [Genre Statistics](#genre-statistics)
        -   [User Rating Distribution](#user-rating-distribution)
    -   [Watchlist Picker](#watchlist-picker)
-   [Inspiration](#inspiration)
-   [Limitations](#limitations)
-   [The Future](#the-future)

## Sitemap

```
root
|_ Recommendations
|_ Statistics
|_ Watchlist Picker
|_ FAQ
|_ Metrics
```

## Technologies

-   Frontend:
    -   `React`, `TypeScript`, `Tailwind CSS`.
    -   Deployed on `Vercel`.
-   Backend:
    -   `Flask`, `Supabase (postgreSQL)`.
    -   Deployed on `Render`.
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

The URLs for the Letterboxd pages of ~83,000 movies are stored in the database.
To reduce client latency, the data from these movies is asychronously scraped
twice a month through a scheduled GitHub Action.

The following features are stored:

-   `movie_id`,
-   `url`,
-   `title`,
-   `release_year`,
-   `runtime`,
-   `genres`,
-   `country_of_origin`,
-   `letterboxd_rating`,
-   `letterboxd_rating_count`,
-   `poster`.

#### User Rating Collection

When the user inputs their username, their Letterboxd ratings are scraped from
their profile. The following features are aggregated:

-   `movie_id`,
-   `user_rating`,
-   `liked`,
-   `url`,
-   `username`.

Currently, the `liked` feature is not in use.

The Letterboxd URLs of the movies scraped from the user's profile are also
upserted into the existing master table. This allows for organic growth in the
number of movies whose data is scraped each week.

#### Recommendation Model

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
-   `is_western (int)`.

The target feature is `user_rating (float)`.

A new random forest model is trained each time the user inputs their username.
This introduces additional variability across users, but allows for each model
to be singularly based upon its user's rating habits. Contrary to expectations,
experimental testing suggests there is no correlation between the number of user
ratings and model performance.

#### Multi-User Recommendations

Since people often watch movies in a group setting, functionality was added to
support multi-user recommendations. When multiple usernames are input,
recommendations are initially generated for each user following the normal
procedure. Next, the recommendations are filtered to only keep movies that are
recommended for all users. Then, each user's predicted ratings are averaged for
each of the overlapping recommendations. Finally, the recommendations are
resorted based on the average predicted rating and output to the users.

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
love or hate the most relative to their peers.

#### User Rating Distribution

First, the user's ratings are scraped from their profile and used to create a
histogram portraying the distribution. Then, a line chart visualizing the
density of Letterboxd ratings for the same movies is overlayed, allowing the
user to understand their movie rating patterns in comparison to the Letterboxd
community. This graphic is also downloadable as a PNG on desktop.

### Watchlist Picker

## Inspiration

## Limitations

## The Future
