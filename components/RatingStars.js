import StarIcon from "./StarIcon";
import styles from "./RatingStars.module.css";

const STARS = [1, 2, 3, 4, 5];

// The user's rating as five small stars, for showing only: nothing here can
// be clicked, so it is safe inside a link. `rating` is 1 to 5, or null for
// a movie that is watched but not rated yet.
export default function RatingStars({ rating }) {
  return (
    // role="img" makes screen readers read the label instead of five stars
    <span
      role="img"
      aria-label={
        rating ? `Your rating: ${rating} out of 5` : "Watched, not rated yet"
      }
      className={styles.stars}
    >
      {STARS.map((stars) => (
        <span
          key={stars}
          className={stars <= (rating ?? 0) ? styles.lit : styles.star}
        >
          <StarIcon size={14} />
        </span>
      ))}
    </span>
  );
}
