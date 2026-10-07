import "server-only";
import { getDb } from "./db";
import { getMovies } from "./ghibli";

// The first rating is free. After that it can be changed this many times.
export const MAX_RATING_CHANGES = 1;

// times_rated counts every save: the first rating, then each change
function changesLeft(timesRated) {
  return Math.min(MAX_RATING_CHANGES, MAX_RATING_CHANGES + 1 - timesRated);
}

// The most recently watched movie comes first. As with the watchlist, the
// database only stores what the user did. Titles and posters come from the
// Ghibli API and are matched up here by movie id.
export async function getWatched(userEmail) {
  const db = await getDb();
  const [rows] = await db.execute(
    `SELECT movie_id AS id, rating, times_rated AS timesRated
     FROM watched
     WHERE user_email = ? AND is_watched
     ORDER BY watched_at DESC, movie_id`,
    [userEmail]
  );
  if (rows.length === 0) return [];

  const movies = await getMovies();
  return rows.flatMap((row) => {
    const movie = movies.find((m) => m.id === row.id);
    // A movie that has disappeared from the API is left out
    if (!movie) return [];

    return {
      id: movie.id,
      title: movie.title,
      image: movie.image,
      release_date: movie.release_date,
      rating: row.rating,
      changesLeft: changesLeft(row.timesRated),
    };
  });
}

// Adds the user's own state to each movie, for the browsing pages:
// `watched` (true or false) and `rating` (1 to 5, or null).
export async function addWatchedInfo(movies, userEmail) {
  const watched = await getWatched(userEmail);
  // A Map finds a movie's rating by its id without searching the whole list
  const ratings = new Map(watched.map((movie) => [movie.id, movie.rating]));

  return movies.map((movie) => ({
    ...movie,
    watched: ratings.has(movie.id),
    rating: ratings.get(movie.id) ?? null,
  }));
}

// The numbers for the home page. They are worked out from getWatched(), so
// they always agree with what the watched page shows.
export async function getWatchedStats(userEmail) {
  const [watched, movies] = await Promise.all([
    getWatched(userEmail),
    getMovies(),
  ]);
  const ratings = watched
    .map((movie) => movie.rating)
    .filter((rating) => rating !== null);
  const sum = ratings.reduce((total, rating) => total + rating, 0);

  return {
    total: movies.length,
    watched: watched.length,
    unwatched: movies.length - watched.length,
    rated: ratings.length,
    // null when nothing is rated yet, because there is nothing to average
    averageRating: ratings.length > 0 ? sum / ratings.length : null,
  };
}

// Returns { rating, changesLeft } when the user has watched the movie,
// otherwise null. The rating inside is null until they pick some stars.
export async function getWatchedEntry(userEmail, movieId) {
  const db = await getDb();
  const [[row]] = await db.execute(
    `SELECT rating, times_rated AS timesRated
     FROM watched
     WHERE user_email = ? AND movie_id = ? AND is_watched`,
    [userEmail, movieId]
  );
  return row
    ? { rating: row.rating, changesLeft: changesLeft(row.timesRated) }
    : null;
}

// A movie that was unmarked earlier still has its row. Marking it again
// brings that row back and puts it at the top of the list. A movie that is
// already marked is left exactly as it is.
export async function saveWatchedEntry(userEmail, movieId) {
  const db = await getDb();
  await db.execute(
    `INSERT INTO watched (user_email, movie_id)
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE
       watched_at = IF(is_watched, watched_at, CURRENT_TIMESTAMP(3)),
       is_watched = TRUE`,
    [userEmail, movieId]
  );
}

// Hides the row and wipes its rating and its count of saves. Marking the
// movie again therefore starts from the beginning: no stars, and the full
// number of changes.
export async function unmarkWatchedEntry(userEmail, movieId) {
  const db = await getDb();
  await db.execute(
    `UPDATE watched
     SET is_watched = FALSE, rating = NULL, times_rated = 0
     WHERE user_email = ? AND movie_id = ?`,
    [userEmail, movieId]
  );
}

// `rating` is 1 to 5. Returns false when nothing was saved: the movie is
// not marked as watched, or its changes are used up.
// The limit is checked inside the UPDATE itself, so two clicks arriving at
// the same moment cannot both slip through.
export async function saveRating(userEmail, movieId, rating) {
  const db = await getDb();
  const [result] = await db.execute(
    `UPDATE watched
     SET rating = ?, times_rated = times_rated + 1
     WHERE user_email = ? AND movie_id = ? AND is_watched AND times_rated <= ?`,
    [rating, userEmail, movieId, MAX_RATING_CHANGES]
  );
  return result.affectedRows > 0;
}
