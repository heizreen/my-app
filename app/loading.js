import styles from "./loading.module.css";

export default function Loading() {
  return (
    <main className={styles.loading}>
      <span className={styles.spinner} />
      <p>Loading...</p>
    </main>
  );
}
