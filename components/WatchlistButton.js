"use client";

import { useRef, useTransition } from "react";
import { removeFromWatchlist } from "@/lib/actions";
import WatchlistDialog from "./WatchlistDialog";

// `isSaved` is worked out on the server from the database
export default function WatchlistButton({ movie, isSaved }) {
  const dialogRef = useRef(null);
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (isSaved) {
      startTransition(async () => {
        await removeFromWatchlist(movie.id);
      });
    } else {
      // showModal() opens the <dialog> as a popup above the page
      dialogRef.current.showModal();
    }
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={pending}
        aria-pressed={isSaved}
        className={isSaved ? "button secondary" : "button"}
      >
        {isSaved ? "✓ In watchlist" : "+ Add to watchlist"}
      </button>

      <WatchlistDialog
        ref={dialogRef}
        movie={movie}
        heading="Add to watchlist"
      />
    </>
  );
}
