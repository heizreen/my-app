"use server";

import { revalidatePath } from "next/cache";
import { getUser } from "./auth";
import { getMovie } from "./ghibli";
import { createUser } from "./users";
import {
  MAX_RATING_CHANGES,
  getWatchedEntry,
  saveRating,
  saveWatchedEntry,
  unmarkWatchedEntry,
} from "./watched";
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

// Tells Next.js these pages show the user's watchlist and watched data, so
// they are re-rendered
function refreshUserPages() {
  // The home page shows the user's stats
  revalidatePath("/");
  revalidatePath("/watchlist");
  revalidatePath("/watched");
  revalidatePath("/search");
  // "layout" covers every page under /movies: the list, the director pages
  // and each movie's own page
  revalidatePath("/movies", "layout");
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
  refreshUserPages();

  return { error: null };
}

export async function removeFromWatchlist(movieId) {
  const user = await getUser();
  if (!user) return { error: "Please log in first." };

  await deleteWatchlistEntry(user.email, String(movieId));
  refreshUserPages();

  return { error: null };
}

export async function markWatched(movieId) {
  const user = await getUser();
  if (!user) return { error: "Please log in first." };

  // Only real movies can be marked
  const movie = await getMovie(String(movieId));
  if (movie?.id !== movieId) return { error: "Movie not found." };

  await saveWatchedEntry(user.email, movieId);
  // The watchlist is for movies still to watch, so this one comes off it
  await deleteWatchlistEntry(user.email, movieId);
  refreshUserPages();

  return { error: null };
}

export async function unmarkWatched(movieId) {
  const user = await getUser();
  if (!user) return { error: "Please log in first." };

  await unmarkWatchedEntry(user.email, String(movieId));
  refreshUserPages();

  return { error: null };
}

// `rating` is a whole number from 1 to 5
export async function rateMovie(movieId, rating) {
  const user = await getUser();
  if (!user) return { error: "Please log in first." };

  if (![1, 2, 3, 4, 5].includes(rating)) {
    return { error: "Please choose 1 to 5 stars." };
  }

  const id = String(movieId);
  const entry = await getWatchedEntry(user.email, id);
  if (!entry) return { error: "Mark the movie as watched before rating it." };
  // Picking the rating it already has changes nothing, so it is not counted
  if (entry.rating === rating) return { error: null };

  // The stars are switched off in the browser once the changes are used up,
  // but the browser cannot be trusted, so the limit is enforced here
  const saved = await saveRating(user.email, id, rating);
  if (!saved) {
    const times =
      MAX_RATING_CHANGES === 1 ? "once" : `${MAX_RATING_CHANGES} times`;
    return { error: `A rating can only be changed ${times}.` };
  }
  refreshUserPages();

  return { error: null };
}
