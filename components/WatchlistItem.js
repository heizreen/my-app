"use client";

import { useRef } from "react";
import MovieCard from "./MovieCard";
import WatchlistDialog from "./WatchlistDialog";
import styles from "./WatchlistItem.module.css";

// "2026-10-12" -> "12 Oct 2026"
function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString("en-GB", {
    dateStyle: "medium",
    timeZone: "UTC",
  });
}

// One movie on the watchlist page: the usual card, then the saved details
// with an edit button. The button sits outside the card because the whole
// card is a link, and a button cannot go inside a link.
export default function WatchlistItem({ movie, eager }) {
  const dialogRef = useRef(null);

  return (
    <div>
      <MovieCard movie={movie} eager={eager} />

      <div className={styles.details}>
        <div className={styles.text}>
          {movie.targetDate && (
            <p className={styles.target}>
              Target date: {formatDate(movie.targetDate)}
            </p>
          )}
          {movie.notes && <p className={styles.notes}>{movie.notes}</p>}
          {!movie.targetDate && !movie.notes && (
            <p className={styles.notes}>No target date or notes</p>
          )}
        </div>

        <button
          onClick={() => dialogRef.current.showModal()}
          aria-label={`Edit target date and notes for ${movie.title}`}
          title="Edit target date and notes"
          className={styles.edit}
        >
          {/* Pencil icon */}
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
        </button>
      </div>

      <WatchlistDialog
        ref={dialogRef}
        movie={movie}
        heading="Edit watchlist details"
      />
    </div>
  );
}
