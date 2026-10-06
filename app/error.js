"use client"; // Error boundaries must be Client Components

export default function Error({ error, retry }) {
  return (
    <main className="stack">
      <h1>Something went wrong</h1>
      <p className="muted">{error.message}</p>
      <button onClick={() => retry()} className="button">
        Try again
      </button>
    </main>
  );
}
