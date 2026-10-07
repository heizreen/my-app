"use client";

import { startTransition, useOptimistic, useState } from "react";
import { rateMovie } from "@/lib/actions";
import StarIcon from "./StarIcon";
import styles from "./StarRating.module.css";

const STARS = [1, 2, 3, 4, 5];

// Five star buttons. `rating` and `changesLeft` are worked out on the server
// from the database. `rating` is 1 to 5, or null when the movie has no
// rating yet. `changesLeft` is how many more times it can be changed.
export default function StarRating({ movie, rating, changesLeft }) {
  // Shows a new rating straight away, while the Server Action is still
  // saving it. Once the action has finished, it follows `rating` again.
  const [shown, setShown] = useOptimistic(rating);
  // The star under the mouse, so the stars up to it can light up
  const [hovered, setHovered] = useState(null);
  const [error, setError] = useState(null);
  // With no changes left the stars only show the rating. The server checks
  // the limit as well, because a button can be switched back on by hand.
  const locked = changesLeft === 0;

  function handleClick(stars) {
    // Clicking the rating it already has would use up a change for nothing
    if (stars === shown) return;
    setHovered(null);
    setError(null);

    startTransition(async () => {
      setShown(stars);
      const result = await rateMovie(movie.id, stars);
      setError(result.error);
    });
  }

  const lit = (locked ? null : hovered) ?? shown ?? 0;

  return (
    <div className={styles.rating}>
      <div
        role="group"
        aria-label={`Your rating for ${movie.title}`}
        onMouseLeave={() => setHovered(null)}
        className={styles.stars}
      >
        {STARS.map((stars) => (
          <button
            key={stars}
            onClick={() => handleClick(stars)}
            onMouseEnter={() => setHovered(stars)}
            disabled={locked}
            aria-label={stars === 1 ? "1 star" : `${stars} stars`}
            aria-pressed={stars === shown}
            className={stars <= lit ? styles.lit : styles.star}
          >
            {/* The CSS fills the star in when it is lit */}
            <StarIcon />
          </button>
        ))}
      </div>

      <p className={styles.hint}>
        {locked
          ? "No rating changes left"
          : changesLeft === 1
            ? "1 rating change left"
            : `${changesLeft} rating changes left`}
      </p>

      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
    </div>
  );
}
