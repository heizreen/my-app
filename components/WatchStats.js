import Link from "next/link";
import { getUser } from "@/lib/auth";
import { getWatchedStats } from "@/lib/watched";
import styles from "./WatchStats.module.css";

// A Server Component that fetches its own data. The home page wraps it in
// <Suspense>, so the rest of the page does not have to wait for the database.
export default async function WatchStats() {
  const user = await getUser();
  // The stats are personal, so a visitor who is not logged in gets nothing
  if (!user) return null;

  const stats = await getWatchedStats(user.email);
  const percent =
    stats.total > 0 ? Math.round((stats.watched / stats.total) * 100) : 0;

  return (
    <section aria-labelledby="stats-heading" className={styles.stats}>
      <div className={styles.header}>
        <h2 id="stats-heading" className={styles.heading}>
          Your stats
        </h2>
        <Link href="/watched" className="link">
          See watched movies
        </Link>
      </div>

      {/* A description list: each <dt> names a number, each <dd> gives it */}
      <dl className={styles.tiles}>
        <div className={styles.tile}>
          <dt>Watched</dt>
          <dd>
            <span className={styles.value}>{stats.watched}</span>
            <span className={styles.hint}>of {stats.total} movies</span>
          </dd>
        </div>

        <div className={styles.tile}>
          <dt>Unwatched</dt>
          <dd>
            <span className={styles.value}>{stats.unwatched}</span>
            <span className={styles.hint}>still to watch</span>
          </dd>
        </div>

        <div className={styles.tile}>
          <dt>Average rating</dt>
          {stats.averageRating === null ? (
            <dd>
              <span className={styles.value} aria-hidden="true">
                –
              </span>
              <span className={styles.hint}>No ratings yet</span>
            </dd>
          ) : (
            <dd>
              {/* toFixed(1) keeps one decimal place: 4.333 -> "4.3" */}
              <span className={styles.value}>
                {stats.averageRating.toFixed(1)}
              </span>
              <span className={styles.hint}>
                out of 5, from {stats.rated} rated{" "}
                {stats.rated === 1 ? "movie" : "movies"}
              </span>
            </dd>
          )}
        </div>
      </dl>

      <div className={styles.progress}>
        {/* The aria- attributes give screen readers the same numbers */}
        <div
          role="progressbar"
          aria-label="Movies watched"
          aria-valuemin={0}
          aria-valuemax={stats.total}
          aria-valuenow={stats.watched}
          className={styles.track}
        >
          <div className={styles.fill} style={{ width: `${percent}%` }} />
        </div>
        <span className={styles.percent}>{percent}% watched</span>
      </div>
    </section>
  );
}
