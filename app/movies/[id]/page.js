import Image from "next/image";
import { notFound } from "next/navigation";
import StarRating from "@/components/StarRating";
import WatchedButton from "@/components/WatchedButton";
import WatchlistButton from "@/components/WatchlistButton";
import { getUser } from "@/lib/auth";
import { getMovie } from "@/lib/ghibli";
import { getWatchedEntry } from "@/lib/watched";
import { isInWatchlist } from "@/lib/watchlist";
import styles from "../movies.module.css";

// Both generateMetadata and the page call this. Next.js dedupes the
// identical fetch, so the API is only requested once.
async function loadMovie(params) {
  const { id } = await params;
  const movie = await getMovie(id);
  if (!movie) notFound();

  return movie;
}

export async function generateMetadata({ params }) {
  const movie = await loadMovie(params);
  return { title: movie.title, description: movie.description };
}

export default async function MoviePage({ params }) {
  const movie = await loadMovie(params);
  const user = await getUser();
  // Database lookups, done on the server before the page is sent.
  // Promise.all runs the two at the same time instead of one after the other.
  const [isSaved, watched] = user
    ? await Promise.all([
        isInWatchlist(user.email, movie.id),
        getWatchedEntry(user.email, movie.id),
      ])
    : [false, null];
  // Client Components only need these two fields, not the whole movie
  const basics = { id: movie.id, title: movie.title };

  return (
    <main>
      <div className={styles.banner}>
        {/* Decorative, so the alt text is empty */}
        <Image
          src={movie.movie_banner}
          alt=""
          fill
          sizes="(max-width: 1200px) 100vw, 1000px"
          loading="eager"
          className={styles.bannerImage}
        />
      </div>

      <div className={styles.detail}>
        <Image
          src={movie.image}
          alt={`${movie.title} poster`}
          width={300}
          height={450}
          loading="eager"
          className={styles.poster}
        />
        <div className={styles.info}>
          <h1>{movie.title}</h1>
          <p className={styles.original}>
            {movie.original_title} ({movie.original_title_romanised})
          </p>
          <ul className={styles.chips}>
            <li>{movie.release_date}</li>
            <li>{movie.running_time} min</li>
            <li>Rotten Tomatoes {movie.rt_score}%</li>
          </ul>
          <p className={styles.overview}>{movie.description}</p>
          <dl className={styles.credits}>
            <div>
              <dt>Director</dt>
              <dd>{movie.director}</dd>
            </div>
            <div>
              <dt>Producer</dt>
              <dd>{movie.producer}</dd>
            </div>
          </dl>

          {/* Only logged-in users get the buttons. The Server Component
              passes plain data to these Client Components. */}
          {user && (
            <div className={styles.actions}>
              <WatchlistButton movie={basics} isSaved={isSaved} />
              <WatchedButton movie={basics} isWatched={watched !== null} />
            </div>
          )}

          {/* The stars only appear once the movie is marked as watched */}
          {watched && (
            <div className={styles.rating}>
              <span className={styles.ratingLabel}>Your rating</span>
              <StarRating
                movie={basics}
                rating={watched.rating}
                changesLeft={watched.changesLeft}
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
