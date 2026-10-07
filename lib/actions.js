"use server";

import { revalidatePath } from "next/cache";
import { getUser } from "./auth";
import { getMovie } from "./ghibli";
import { createUser } from "./users";
import { deleteWatchlistEntry, saveWatchlistEntry } from "./watchlist";

// Server Actions: functions the browser can call, but which run on the
// server. Anyone can call them with any values, so each one checks who is
// logged in and validates what it was sent. They return { error } with a
// message, or { error: null } on success.

export async function signUp(formData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!name || !email || !password) {
    return { error: "Please fill in every field." };
  }
  if (name.length > 50 || email.length > 254 || password.length > 200) {
    return { error: "One of the fields is too long." };
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return { error: "Please enter a valid email address." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const user = await createUser({ name, email, password });
  if (!user) {
    return { error: "An account with this email already exists." };
  }

  return { error: null };
}

// Tells Next.js these pages show watchlist data, so they are re-rendered
function refreshWatchlistPages(movieId) {
  revalidatePath("/watchlist");
  revalidatePath(`/movies/${movieId}`);
}

// Used by the popup form for both adding a movie and editing its details
export async function saveToWatchlist(movieId, formData) {
  // The user comes from the login cookie, never from the browser's request
  const user = await getUser();
  if (!user) return { error: "Please log in first." };

  const targetDate = String(formData.get("targetDate") ?? "");
  // Browsers send line breaks as \r\n, which would count as two characters
  const notes = String(formData.get("notes") ?? "")
    .replace(/\r\n/g, "\n")
    .trim();

  if (targetDate && !/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) {
    return { error: "Please enter a valid date." };
  }
  if (notes.length > 200) {
    return { error: "Notes can be at most 200 characters." };
  }

  // Only real movies can be saved
  const movie = await getMovie(String(movieId));
  if (movie?.id !== movieId) return { error: "Movie not found." };

  await saveWatchlistEntry(user.email, movieId, { targetDate, notes });
  refreshWatchlistPages(movieId);

  return { error: null };
}

export async function removeFromWatchlist(movieId) {
  const user = await getUser();
  if (!user) return { error: "Please log in first." };

  await deleteWatchlistEntry(user.email, String(movieId));
  refreshWatchlistPages(movieId);

  return { error: null };
}
