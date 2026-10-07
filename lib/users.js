import "server-only";
import {
  randomBytes,
  randomUUID,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { getDb } from "./db";

// Passwords are never stored as typed, only as a salted hash
function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function passwordMatches(password, stored) {
  const [salt, hash] = stored.split(":");
  return timingSafeEqual(
    scryptSync(password, salt, 64),
    Buffer.from(hash, "hex")
  );
}

// Returns the new user, or null when the email is already taken
export async function createUser({ name, email, password }) {
  const user = { id: randomUUID(), name, email };

  // The UNIQUE rule on the email column rejects a second account. With
  // IGNORE that shows up as zero rows added instead of an error.
  const db = await getDb();
  const [result] = await db.execute(
    `INSERT IGNORE INTO users (id, name, email, password_hash)
     VALUES (?, ?, ?, ?)`,
    [user.id, name, email, hashPassword(password)]
  );
  if (result.affectedRows === 0) return null;

  return user;
}

// Returns the user when the email and password are correct, otherwise null
export async function verifyUser(email, password) {
  const db = await getDb();
  // The rows come back as a list, and an email matches one row at most
  const [[user]] = await db.execute(
    `SELECT id, name, email, password_hash AS passwordHash
     FROM users
     WHERE email = ?`,
    [email]
  );
  if (!user || !passwordMatches(password, user.passwordHash)) return null;

  return { id: user.id, name: user.name, email: user.email };
}
