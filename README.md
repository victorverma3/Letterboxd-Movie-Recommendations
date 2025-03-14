# Letterboxd-Movie-Recommendations

Generate AI-powered movie recommendations, discover unique profile statistics,
and pick movies from your watchlist, all with just your Letterboxd username.

[www.recommendations.victorverma.com](https://www.recommendations.victorverma.com/)

## Sitemap

```
root
|_ Recommendations
|_ Statistics
|_ Watchlist
|_ FAQ
|_ Metrics
```

## Technologies

-   Frontend:
    -   `React`, `TypeScript`.
    -   Deployed on `Vercel`.
-   Backend:
    -   `Flask`, `Supabase (postgreSQL)`.
    -   Deployed on `Render`.
-   Tools:
    -   `GitHub Actions`.

## Core Features

### Recommendations

The user inputs their Letterboxd username and the website generates movie
recommendations for them based on their Letterboxd profile.

#### Architecture

The underlying architecture is `content-based filtering`, which infers a rating
based on the characteristics of the movie. An alternative approach is
`collaborative filtering`, which infers a rating based on rating patterns across
users without explicit movie characteristics. The former was selected over the
latter so that a user's recommendations are only based upon their own Letterboxd
profile. The architecture could someday be changed to the `two-tower`
recommender system, which is a combination of the previous two.

#### Movie Data Collection

The URLs for the Letterboxd pages of ~83,000 movies are stored in the database.
To reduce client latency, the data from these movies is scraped asychronously
every Monday morning through an automated GitHub Action.

The following features are stored: `movie_id`, `url`, `title`, `release_year`,
`runtime`, `genres`, `country_of_origin`, `letterboxd_rating`,
`letterboxd_rating_count`, and `poster`.

#### User Rating Collection

When the user inputs their username, their Letterboxd ratings are scraped from
their profile. The following features are aggregated: `movie_id`, `user_rating`,
`liked`, `url`, and `username`. Currently, the `liked` feature is not in use.

The Letterboxd URLs of the movies scraped from the user's profile are also
upserted into the existing table. This allows for organic growth in the number
of movies whose data is scraped each week.

#### Recommendation Model

When a user inputs their username, the stored movie data is read from the
database. This is merged with the user ratings on the key `(movie_id, url)` to
create the data used to train the machine learning model.

The training features are `release_year `, `runtime`, `genres`,
`country_of_origin`, `letterboxd_rating`, `letterboxd_rating_count`,
`is_action`, `is_adventure`, `is_animation`, `is_comedy`, `is_crime`,
`is_documentary`, `is_drama`, `is_family`, `is_fantasy`, `is_history`,
`is_horror`, `is_music`, `is_mystery`, `is_romance`, `is_science_fiction`,
`is_tv_movie`, `is_thriller`, `is_war`, and `is_western`. The target feature is
`user_rating`.

A new random forest model is trained each time the user inputs their username.
This introduces additional variability across users, but allows for each model
to be singularly based upon its user's rating habits. Contrary to expectations,
testing shows that there is no correlation between the number of user ratings on
their profile and model performance.

#### Multi-User Recommendations

Since people often watch movies in a group setting, functionality was added to
support multi-user recommendations. When multiple usernames are input,
recommendations are first generated for each user following the normal
procedure. Next, the recommendations are filtered to only keep movies that are
recommended for all users. Then, each user's predicted ratings are averaged for
each of the overlapping recommendations. Finally, the recommendations are
resorted based on the average predicted rating and output to the users.

### Statistics

### Watchlist

## Inspiration

## Limitations

## The Future
