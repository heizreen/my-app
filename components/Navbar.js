"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import SearchBar from "./SearchBar";
import styles from "./Navbar.module.css";

const links = [
  { href: "/", label: "Home" },
  { href: "/movies", label: "Movies" },
  { href: "/watchlist", label: "Watchlist", loggedInOnly: true },
  { href: "/watched", label: "Watched", loggedInOnly: true },
  { href: "/about", label: "About" },
];

// `user` comes from the root layout, which reads the session on the server.
// It is null when nobody is logged in.
export default function Navbar({ user }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await signOut({ redirect: false });
    router.push("/");
    // Re-renders the layout on the server so the navbar updates
    router.refresh();
  }

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          Movie Browser
        </Link>
        <nav className={styles.nav}>
          {links
            .filter((link) => user || !link.loggedInOnly)
            .map(({ href, label }) => {
              const isActive =
                href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={isActive ? styles.active : styles.link}
                  aria-current={isActive ? "page" : undefined}
                >
                  {label}
                </Link>
              );
            })}
        </nav>
        <SearchBar />
        <div className={styles.account}>
          {user ? (
            <>
              <span className={styles.user}>Hi, {user.name}</span>
              <button onClick={handleLogout} className={styles.link}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={styles.link}>
                Log in
              </Link>
              <Link href="/signup" className={styles.signup}>
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
