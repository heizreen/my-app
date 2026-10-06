import DirectorNav from "@/components/DirectorNav";
import { getDirectors } from "@/lib/ghibli";
import styles from "./movies.module.css";

export default async function MoviesLayout({ children }) {
  const directors = await getDirectors();

  return (
    <div className={styles.wrapper}>
      <aside className={styles.sidebar}>
        <h2 className={styles.heading}>Directors</h2>
        <DirectorNav directors={directors} />
      </aside>
      {children}
    </div>
  );
}
