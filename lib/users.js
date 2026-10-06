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
export function createUser({ name, email, password }) {
  const user = { id: randomUUID(), name, email };

  // The UNIQUE rule on the email column rejects a second account. With
  // DO NOTHING that shows up as zero rows changed instead of an error.
  const result = getDb()
    .prepare(
      `INSERT INTO users (id, name, email, password_hash)
       VALUES (?, ?, ?, ?)
       ON CONFLICT (email) DO NOTHING`
    )
    .run(user.id, name, email, hashPassword(password));
  if (result.changes === 0) return null;

  return user;
}

// Returns the user when the email and password are correct, otherwise null
export function verifyUser(email, password) {
  const user = getDb()
    .prepare(
      `SELECT id, name, email, password_hash AS passwordHash
       FROM users
       WHERE email = ?`
    )
    .get(email);
  if (!user || !passwordMatches(password, user.passwordHash)) return null;

  return { id: user.id, name: user.name, email: user.email };
}
