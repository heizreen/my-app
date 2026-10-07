import FilteredMovieGrid from "@/components/FilteredMovieGrid";
import { getMovies } from "@/lib/ghibli";

export const metadata = { title: "All movies" };

// `searchParams` is the part of the address after the "?"
export default async function MoviesPage({ searchParams }) {
  const movies = await getMovies();

  return (
    <main>
      <h1>Studio Ghibli movies</h1>
      <FilteredMovieGrid
        movies={movies}
        pathname="/movies"
        searchParams={searchParams}
      />
    </main>
  );
}
