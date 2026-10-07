import "server-only";
import mysql from "mysql2/promise";

// The connection details come from .env.local, so the password is never
// written in the code
function createPool() {
  return mysql.createPool({
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    // TiDB Cloud only accepts encrypted connections. A MySQL running on
    // this computer usually has none, which is what MYSQL_SSL=false is for.
    ssl:
      process.env.MYSQL_SSL === "true"
        ? { minVersion: "TLSv1.2", rejectUnauthorized: true }
        : undefined,
    // A pool keeps a few connections open and shares them between requests
    connectionLimit: 5,
  });
}

async function openDatabase() {
  const pool = createPool();

  // Creates the tables the first time the app runs, and does nothing after
  // that.

  // One row per account. UNIQUE stops two accounts sharing an email.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id            CHAR(36)     PRIMARY KEY,
      name          VARCHAR(50)  NOT NULL,
      email         VARCHAR(254) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL
    )
  `);

  // One row is one movie on one user's watchlist. added_at records when it
  // was saved, so the watchlist can be shown in that order.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS watchlist (
      user_email  VARCHAR(254) NOT NULL,
      movie_id    VARCHAR(64)  NOT NULL,
      target_date VARCHAR(10)  NOT NULL DEFAULT '',
      notes       VARCHAR(200) NOT NULL DEFAULT '',
      added_at    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      PRIMARY KEY (user_email, movie_id)
    )
  `);

  // One row is one movie a user has watched. rating is 1 to 5 stars, and
  // stays NULL (empty) until the user picks some. times_rated counts how
  // often the rating was saved, which is what the limit on changes checks.
  // is_watched turns FALSE when the user unmarks the movie, and the rating
  // and the count are wiped at the same moment.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS watched (
      user_email  VARCHAR(254) NOT NULL,
      movie_id    VARCHAR(64)  NOT NULL,
      rating      TINYINT      NULL,
      watched_at  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      times_rated TINYINT      NOT NULL DEFAULT 0,
      is_watched  BOOLEAN      NOT NULL DEFAULT TRUE,
      PRIMARY KEY (user_email, movie_id)
    )
  `);

  // CREATE TABLE IF NOT EXISTS leaves an existing table as it is, so a
  // database from before these two columns existed gets them added here
  if (
    await addColumn(pool, "watched", "times_rated TINYINT NOT NULL DEFAULT 0")
  ) {
    // A rating from before the limit existed counts as the first rating
    await pool.query(
      "UPDATE watched SET times_rated = 1 WHERE rating IS NOT NULL"
    );
  }
  await addColumn(pool, "watched", "is_watched BOOLEAN NOT NULL DEFAULT TRUE");

  return pool;
}

// Returns true when the column was added, false when it was already there
async function addColumn(pool, table, column) {
  try {
    await pool.query(`ALTER TABLE ${table} ADD COLUMN ${column}`);
    return true;
  } catch (error) {
    if (error.code === "ER_DUP_FIELDNAME") return false;
    throw error;
  }
}

// One shared pool, opened the first time it is needed. Talking to a database
// over the network takes time, so this returns a promise and callers await
// it. It is kept on globalThis because in development this file is reloaded
// after every edit, which would otherwise open a new pool each time. It also
// means the tables above are only created when the dev server starts, so
// restart it after adding a new table.
export function getDb() {
  globalThis.movieBrowserPool ??= openDatabase().catch((error) => {
    // Forget a failed attempt, so the next request tries again
    globalThis.movieBrowserPool = undefined;
    throw error;
  });
  return globalThis.movieBrowserPool;
}
