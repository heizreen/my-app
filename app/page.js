import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.hero}>
      <div className={styles.intro}>
        <h1>Hello, Next.js</h1>
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
          src="/profilepic.jpg"
          alt="Profile picture"
          width={600}
          height={403}
          loading="eager"
          className={styles.photo}
        />
        <figcaption>Enjoy your movie-watching experience!</figcaption>
      </figure>
    </main>
  );
}
