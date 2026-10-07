import Image from "next/image";
import Link from "next/link";
import RatingStars from "./RatingStars";
import styles from "./MovieCard.module.css";

// No "use client" and no server-only code, so this works in both
// Server Components (/movies) and Client Components (/watchlist).
//
// `movie.watched` is only there on the browsing pages, where
// addWatchedInfo() has added it. Those cards show the user's rating.
export default function MovieCard({ movie, eager = false }) {
  return (
    <Link href={`/movies/${movie.id}`} className={styles.card}>
      <div className={styles.frame}>
        {movie.image ? (
          <Image
            src={movie.image}
            alt={`${movie.title} poster`}
            width={300}
            height={450}
            loading={eager ? "eager" : "lazy"}
            className={styles.poster}
          />
        ) : (
          <div className={styles.placeholder}>No poster</div>
        )}
      </div>
      <h3 className={styles.title}>{movie.title}</h3>
      <p className={styles.year}>{movie.release_date}</p>
      {movie.watched && <RatingStars rating={movie.rating} />}
    </Link>
  );
}
