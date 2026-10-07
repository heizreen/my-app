// The rating choices for ?sort= in the address. Each page puts its own
// default in front of these, such as "Default" or "Recently watched".
export const RATING_SORTS = [
  { value: "highest", label: "Highest rated" },
  { value: "lowest", label: "Lowest rated" },
];

// Orders movies by the user's rating. Movies without a rating go last, in
// the order they arrived in. Any other `sort` returns the list as it is.
export function sortByRating(movies, sort) {
  if (sort !== "highest" && sort !== "lowest") return movies;

  const rated = movies.filter((movie) => movie.rating !== null);
  const unrated = movies.filter((movie) => movie.rating === null);
  // toSorted() gives back a new list. Two movies with the same rating keep
  // the order they had.
  const sorted = rated.toSorted((a, b) =>
    sort === "highest" ? b.rating - a.rating : a.rating - b.rating
  );

  return [...sorted, ...unrated];
}
