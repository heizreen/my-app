import "server-only";

// Free Studio Ghibli API, no account or key needed
const BASE_URL = "https://ghibliapi.vercel.app";

async function ghibli(path) {
  const res = await fetch(`${BASE_URL}${path}`, {
    // The film list rarely changes, so reuse the response for a day
    next: { revalidate: 86400 },
  });

  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Studio Ghibli API request failed (${res.status})`);
  }

  return res.json();
}

// "Gorō Miyazaki" -> "goro-miyazaki"
function toSlug(name) {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
}

export function getMovies() {
  return ghibli("/films");
}

// Returns null when the movie does not exist
export function getMovie(id) {
  return ghibli(`/films/${encodeURIComponent(id)}`);
}

// The API has no directors endpoint, so build the list from the movies
export async function getDirectors() {
  const movies = await getMovies();
  const names = [...new Set(movies.map((movie) => movie.director))].sort();
  return names.map((name) => ({ slug: toSlug(name), name }));
}

export async function getMoviesByDirector(name) {
  const movies = await getMovies();
  return movies.filter((movie) => movie.director === name);
}

// The API has no search endpoint, so filter the full list on the server
export async function searchMovies(query) {
  const movies = await getMovies();
  const q = query.toLowerCase();
  return movies.filter((movie) =>
    [movie.title, movie.original_title_romanised, movie.director].some(
      (text) => text.toLowerCase().includes(q)
    )
  );
}
