import { getUser } from "@/lib/auth";
import { RATING_SORTS, sortByRating } from "@/lib/sort";
import { addWatchedInfo } from "@/lib/watched";
import MovieGrid from "./MovieGrid";
import QueryChips, { pickOption } from "./QueryChips";
import styles from "./FilteredMovieGrid.module.css";

const EMPTY_MESSAGES = {
  all: "No movies here.",
  watched: "None of these movies are marked as watched yet.",
  unwatched: "You have watched every movie here.",
};

const SORTS = [{ value: "default", label: "Default" }, ...RATING_SORTS];

// The movie grid for the browsing pages. For a logged-in user it shows
// their rating on each card, and adds the All / Watched / Unwatched filter
// (?show=) and the sort by rating (?sort=).
export default async function FilteredMovieGrid({
  movies,
  pathname,
  searchParams,
}) {
  const user = await getUser();
  // Watched and ratings are personal, so a visitor gets the plain grid
  if (!user) return <MovieGrid movies={movies} />;

  const params = await searchParams;
  const all = await addWatchedInfo(movies, user.email);
  const watched = all.filter((movie) => movie.watched);
  const unwatched = all.filter((movie) => !movie.watched);

  const filters = [
    { value: "all", label: "All", count: all.length, movies: all },
    {
      value: "watched",
      label: "Watched",
      count: watched.length,
      movies: watched,
    },
    {
      value: "unwatched",
      label: "Unwatched",
      count: unwatched.length,
      movies: unwatched,
    },
  ];
  const filter = pickOption(filters, params.show);
  const sort = pickOption(SORTS, params.sort);
  const shown = sortByRating(filter.movies, sort.value);

  return (
    <>
      <div className={styles.toolbar}>
        <QueryChips
          label="Filter movies"
          name="show"
          options={filters}
          current={filter}
          pathname={pathname}
          params={params}
        />
        <QueryChips
          label="Sort movies"
          heading="Sort"
          name="sort"
          options={SORTS}
          current={sort}
          pathname={pathname}
          params={params}
        />
      </div>

      {shown.length > 0 ? (
        <MovieGrid movies={shown} />
      ) : (
        <p className={styles.empty}>{EMPTY_MESSAGES[filter.value]}</p>
      )}
    </>
  );
}
