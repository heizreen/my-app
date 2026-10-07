import MovieCard from "./MovieCard";
import StarRating from "./StarRating";
import styles from "./WatchedItem.module.css";

// One movie on the watched page: the usual card, then the user's stars. The
// stars sit outside the card because the whole card is a link, and a button
// cannot go inside a link.
export default function WatchedItem({ movie, eager }) {
  return (
    <div className={styles.item}>
      <MovieCard movie={movie} eager={eager} />
      <StarRating
        movie={movie}
        rating={movie.rating}
        changesLeft={movie.changesLeft}
      />
    </div>
  );
}
