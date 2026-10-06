import MovieCard from "./MovieCard";
import styles from "./MovieGrid.module.css";

// Pass `movies` for plain cards, or children to fill the grid yourself
export default function MovieGrid({ movies, children }) {
  return (
    <div className={styles.grid}>
      {/* The first row is visible straight away, so don't lazy-load it */}
      {children ??
        movies.map((movie, index) => (
          <MovieCard key={movie.id} movie={movie} eager={index < 6} />
        ))}
    </div>
  );
}
