import Link from "next/link";
import { redirect } from "next/navigation";
import MovieGrid from "@/components/MovieGrid";
import QueryChips, { pickOption } from "@/components/QueryChips";
import WatchedItem from "@/components/WatchedItem";
import { getUser } from "@/lib/auth";
import { RATING_SORTS, sortByRating } from "@/lib/sort";
import { getWatched } from "@/lib/watched";
import styles from "./watched.module.css";

export const metadata = { title: "Watched" };

const SORTS = [{ value: "recent", label: "Recently watched" }, ...RATING_SORTS];

export default async function WatchedPage({ searchParams }) {
  // Checked on the server, so typing /watched while logged out still ends
  // up on the login page
  const user = await getUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const sort = pickOption(SORTS, params.sort);
  // Read straight from the database, on the server. It arrives with the
  // most recently watched movie first.
  const watched = sortByRating(await getWatched(user.email), sort.value);

  return (
    <main>
      <h1>Watched</h1>
      {watched.length > 0 ? (
        <>
          <div className={styles.toolbar}>
            <QueryChips
              label="Sort movies"
              heading="Sort"
              name="sort"
              options={SORTS}
              current={sort}
              pathname="/watched"
              params={params}
            />
          </div>
          <MovieGrid>
            {watched.map((movie, index) => (
              <WatchedItem key={movie.id} movie={movie} eager={index < 6} />
            ))}
          </MovieGrid>
        </>
      ) : (
        <p className="muted">
          Nothing watched yet.{" "}
          <Link href="/movies" className="link">
            Browse movies
          </Link>{" "}
          and mark the ones you have seen.
        </p>
      )}
    </main>
  );
}
