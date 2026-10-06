"use client";

import { useRef, useState, useTransition } from "react";
import { saveToWatchlist } from "@/lib/actions";
import styles from "./WatchlistDialog.module.css";

// The popup form for a movie's target date and notes. It is used both to
// add a movie and to edit one. The parent opens it with
// ref.current.showModal().
export default function WatchlistDialog({ ref, movie, heading }) {
  const formRef = useRef(null);
  const [error, setError] = useState(null);
  // `pending` is true while the Server Action is running
  const [pending, startTransition] = useTransition();

  function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);

    startTransition(async () => {
      // Runs on the server: saves to the database, then the page is
      // re-rendered with the new data
      const result = await saveToWatchlist(movie.id, formData);
      if (result.error) {
        setError(result.error);
      } else {
        ref.current.close();
      }
    });
  }

  // A click on the dimmed area outside the form lands on the dialog itself
  function handleBackdropClick(event) {
    if (event.target === ref.current) ref.current.close();
  }

  // Puts the fields back to the saved values, discarding unsaved typing
  function handleClose() {
    formRef.current.reset();
    setError(null);
  }

  return (
    <dialog
      ref={ref}
      onClick={handleBackdropClick}
      onClose={handleClose}
      className={styles.dialog}
    >
      <form ref={formRef} onSubmit={handleSubmit} className={styles.form}>
        <div>
          <h2 className={styles.heading}>{heading}</h2>
          <p className="muted">{movie.title}</p>
        </div>

        <label className={styles.field}>
          Target Date to Watch
          <input
            type="date"
            name="targetDate"
            defaultValue={movie.targetDate ?? ""}
          />
        </label>

        <label className={styles.field}>
          Notes
          <textarea
            name="notes"
            rows={3}
            maxLength={200}
            defaultValue={movie.notes ?? ""}
          />
        </label>

        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}

        <div className={styles.actions}>
          <button
            type="button"
            onClick={() => ref.current.close()}
            className="button secondary"
          >
            Cancel
          </button>
          <button type="submit" disabled={pending} className="button">
            {pending ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
