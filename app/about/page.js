import styles from "./about.module.css";

export default function AboutPage() {
  return (
    <main>
      <h1>This App includes:</h1>
      <ul className={styles.features}>
        <li>Movie browsing functionality</li>
        <li>Watchlist management</li>
        <li>Responsive design</li>
        <li>Modern UI/UX</li>
      </ul>
    </main>
  );
}
