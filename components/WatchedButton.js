"use client";

import { useTransition } from "react";
import { markWatched, unmarkWatched } from "@/lib/actions";

// `isWatched` is worked out on the server from the database
export default function WatchedButton({ movie, isWatched }) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      if (isWatched) {
        await unmarkWatched(movie.id);
      } else {
        await markWatched(movie.id);
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      aria-pressed={isWatched}
      className={isWatched ? "button secondary" : "button"}
    >
      {isWatched ? "✓ Watched" : "Mark as watched"}
    </button>
  );
}
