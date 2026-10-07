import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import WatchStats from "@/components/WatchStats";
import { getUser } from "@/lib/auth";
import styles from "./page.module.css";

export default async function Home() {
  // Read from the login cookie, with no trip to the database, so it does
  // not hold the page up. It is null when nobody is logged in.
  const user = await getUser();

  return (
    <main className={styles.hero}>
      <div className={styles.intro}>
        <h1>Hello, {user ? user.name : "Next.js"}</h1>
        <p className={styles.lead}>Welcome to the Movie Browser!</p>
        <p className={styles.text}>
          This app allows you to browse popular movies and manage your watchlist.
        </p>
        <div className={styles.actions}>
          <Link href="/movies" className="button">
            Browse Movies
          </Link>
          <Link href="/about" className="button secondary">
            Learn more about this app
          </Link>
        </div>
      </div>
      <figure className={styles.figure}>
        <Image
          src="/jbareham_200520_1021_ghibli_week_0001b.jpeg"
          alt="Profile picture"
          width={600}
          height={403}
          loading="eager"
          className={styles.photo}
        />
        <figcaption>Enjoy your movie-watching experience!</figcaption>
      </figure>

      {/* WatchStats has to wait for the database. With Suspense the page
          above is sent straight away, and the stats follow when ready. */}
      <Suspense fallback={null}>
        <WatchStats />
      </Suspense>
    </main>
  );
}
