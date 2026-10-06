import "server-only";
import { getDb } from "./db";
import { getMovies } from "./ghibli";

// The values always go in through "?" placeholders, never by joining them
// into the SQL text. That is what keeps the queries safe from SQL injection.

// The database only stores what the user typed. Titles and posters still
// come from the Ghibli API and are matched up here by movie id.
export async function getWatchlist(userEmail) {
  const rows = getDb()
    .prepare(
      `SELECT movie_id AS id, target_date AS targetDate, notes
       FROM watchlist
       WHERE user_email = ?
       ORDER BY rowid`
    )
    .all(userEmail);
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
      targetDate: row.targetDate,
      notes: row.notes,
    };
  });
}

export function isInWatchlist(userEmail, movieId) {
  const row = getDb()
    .prepare("SELECT 1 FROM watchlist WHERE user_email = ? AND movie_id = ?")
    .get(userEmail, movieId);
  return row !== undefined;
}

// Adds the movie, or updates its details when it is already saved
export function saveWatchlistEntry(userEmail, movieId, { targetDate, notes }) {
  getDb()
    .prepare(
      `INSERT INTO watchlist (user_email, movie_id, target_date, notes)
       VALUES (?, ?, ?, ?)
       ON CONFLICT (user_email, movie_id)
       DO UPDATE SET target_date = excluded.target_date, notes = excluded.notes`
    )
    .run(userEmail, movieId, targetDate, notes);
}

export function deleteWatchlistEntry(userEmail, movieId) {
  getDb()
    .prepare("DELETE FROM watchlist WHERE user_email = ? AND movie_id = ?")
    .run(userEmail, movieId);
}
