import Link from "next/link";

// Shown for unknown URLs and whenever a page calls notFound()
export default function NotFound() {
  return (
    <main className="stack">
      <h1>Page not found</h1>
      <p className="muted">That movie or page does not exist.</p>
      <Link href="/movies" className="button">
        Browse movies
      </Link>
    </main>
  );
}
