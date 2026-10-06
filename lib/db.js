import "server-only";
import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import path from "node:path";

// SQLite keeps the whole database in this one file
const FILE = path.join(process.cwd(), "data", "movie-browser.db");

function openDatabase() {
  mkdirSync(path.dirname(FILE), { recursive: true });
  const db = new Database(FILE);

  // Creates the tables the first time the app runs, and does nothing after
  // that.
  db.exec(`
    -- One row per account. UNIQUE stops two accounts sharing an email.
    CREATE TABLE IF NOT EXISTS users (
      id            TEXT PRIMARY KEY,
      name          TEXT NOT NULL,
      email         TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL
    );

    -- One row is one movie on one user's watchlist
    CREATE TABLE IF NOT EXISTS watchlist (
      user_email  TEXT NOT NULL,
      movie_id    TEXT NOT NULL,
      target_date TEXT NOT NULL DEFAULT '',
      notes       TEXT NOT NULL DEFAULT '',
      PRIMARY KEY (user_email, movie_id)
    );
  `);

  return db;
}

// One shared connection, opened the first time it is needed. It is kept on
// globalThis because in development this file is reloaded after every edit,
// which would otherwise open a new connection each time. It also means the
// tables above are only created when the dev server starts, so restart it
// after adding a new table.
export function getDb() {
  globalThis.movieBrowserDb ??= openDatabase();
  return globalThis.movieBrowserDb;
}
