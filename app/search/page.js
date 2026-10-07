import FilteredMovieGrid from "@/components/FilteredMovieGrid";
import { searchMovies } from "@/lib/ghibli";

export const metadata = { title: "Search" };

export default async function SearchPage({ searchParams }) {
  const { q } = await searchParams;
  // ?q=a&q=b gives an array, so only use the first value
  const query = (Array.isArray(q) ? q[0] : q)?.trim();

  if (!query) {
    return (
      <main>
        <h1>Search</h1>
        <p className="muted">
          Type a movie title or director in the search box above.
        </p>
      </main>
    );
  }

  const movies = await searchMovies(query);

  return (
    <main>
      <h1>Results for “{query}”</h1>
      {movies.length > 0 ? (
        <FilteredMovieGrid
          movies={movies}
          pathname="/search"
          searchParams={searchParams}
        />
      ) : (
        <p className="muted">No movies found.</p>
      )}
    </main>
  );
}
