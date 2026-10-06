import Link from "next/link";
import { redirect } from "next/navigation";
import MovieGrid from "@/components/MovieGrid";
import WatchlistItem from "@/components/WatchlistItem";
import { getUser } from "@/lib/auth";
import { getWatchlist } from "@/lib/watchlist";

export const metadata = { title: "My watchlist" };

export default async function WatchlistPage() {
  // Checked on the server, so typing /watchlist while logged out still
  // ends up on the login page
  const user = await getUser();
  if (!user) redirect("/login");

  // Read straight from the database, on the server
  const watchlist = await getWatchlist(user.email);

  return (
    <main>
      <h1>My watchlist</h1>
      {watchlist.length > 0 ? (
        <MovieGrid>
          {watchlist.map((movie, index) => (
            <WatchlistItem key={movie.id} movie={movie} eager={index < 6} />
          ))}
        </MovieGrid>
      ) : (
        <p className="muted">
          Nothing saved yet.{" "}
          <Link href="/movies" className="link">
            Browse movies
          </Link>{" "}
          and add some.
        </p>
      )}
    </main>
  );
}
