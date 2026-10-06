"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./DirectorNav.module.css";

// A Client Component so it can highlight the link for the current page.
// The list itself is fetched on the server and passed in as a prop.
export default function DirectorNav({ directors }) {
  const pathname = usePathname();

  const links = [
    { href: "/movies", label: "All movies" },
    ...directors.map((director) => ({
      href: `/movies/director/${director.slug}`,
      label: director.name,
    })),
  ];

  return (
    <ul className={styles.list}>
      {links.map(({ href, label }) => {
        const isActive = pathname === href;
        return (
          <li key={href}>
            <Link
              href={href}
              className={isActive ? styles.active : styles.link}
              aria-current={isActive ? "page" : undefined}
            >
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
