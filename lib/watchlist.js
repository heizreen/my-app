import "server-only";
import { getDb } from "./db";
import { getMovies } from "./ghibli";

// The values always go in through "?" placeholders, never by joining them
// into the SQL text. That is what keeps the queries safe from SQL injection.

// The database only stores what the user typed. Titles and posters still
// come from the Ghibli API and are matched up here by movie id.
export async function getWatchlist(userEmail) {
  const db = await getDb();
  const [rows] = await db.execute(
    `SELECT movie_id AS id, target_date AS targetDate, notes
     FROM watchlist
     WHERE user_email = ?
     ORDER BY added_at, movie_id`,
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
      targetDate: row.targetDate,
      notes: row.notes,
    };
  });
}

export async function isInWatchlist(userEmail, movieId) {
  const db = await getDb();
  const [rows] = await db.execute(
    "SELECT 1 FROM watchlist WHERE user_email = ? AND movie_id = ?",
    [userEmail, movieId]
  );
  return rows.length > 0;
}

// Adds the movie, or updates its details when it is already saved
export async function saveWatchlistEntry(
  userEmail,
  movieId,
  { targetDate, notes }
) {
  const db = await getDb();
  await db.execute(
    `INSERT INTO watchlist (user_email, movie_id, target_date, notes)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       target_date = VALUES(target_date), notes = VALUES(notes)`,
    [userEmail, movieId, targetDate, notes]
  );
}

export async function deleteWatchlistEntry(userEmail, movieId) {
  const db = await getDb();
  await db.execute(
    "DELETE FROM watchlist WHERE user_email = ? AND movie_id = ?",
    [userEmail, movieId]
  );
}
