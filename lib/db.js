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

  return pool;
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
