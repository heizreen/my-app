import MovieGrid from "@/components/MovieGrid";
import { getMovies } from "@/lib/ghibli";

export const metadata = { title: "All movies" };

export default async function MoviesPage() {
  const movies = await getMovies();

  return (
    <main>
      <h1>Studio Ghibli movies</h1>
      <MovieGrid movies={movies} />
    </main>
  );
}
