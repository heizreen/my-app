import { notFound } from "next/navigation";
import FilteredMovieGrid from "@/components/FilteredMovieGrid";
import { getDirectors, getMoviesByDirector } from "@/lib/ghibli";

async function loadDirector(params) {
  const { slug } = await params;
  const directors = await getDirectors();
  const director = directors.find((d) => d.slug === slug);
  if (!director) notFound();

  return director;
}

export async function generateMetadata({ params }) {
  const director = await loadDirector(params);
  return { title: `Movies by ${director.name}` };
}

export default async function DirectorPage({ params, searchParams }) {
  const director = await loadDirector(params);
  const movies = await getMoviesByDirector(director.name);

  return (
    <main>
      <h1>Movies by {director.name}</h1>
      <FilteredMovieGrid
        movies={movies}
        pathname={`/movies/director/${director.slug}`}
        searchParams={searchParams}
      />
    </main>
  );
}
