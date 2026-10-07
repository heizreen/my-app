import Link from "next/link";
import styles from "./QueryChips.module.css";

// Returns the option that the address asks for, or the first one when the
// address has nothing, or something unknown, for that key
export function pickOption(options, raw) {
  // A key given twice (?show=a&show=b) arrives as an array, so use the first
  const value = [raw].flat()[0];
  return options.find((option) => option.value === value) ?? options[0];
}

// Keeps the rest of the address, such as ?q= on the search page, and only
// changes the one key
function hrefFor(pathname, params, name, value) {
  const query = new URLSearchParams();
  for (const [key, current] of Object.entries(params)) {
    if (key === name) continue;
    for (const item of [current].flat()) query.append(key, item);
  }
  if (value !== null) query.set(name, value);

  const text = query.toString();
  return text ? `${pathname}?${text}` : pathname;
}

// A row of links that each set one key in the address, such as
// ?show=watched or ?sort=highest. The choice lives in the address, so it
// survives a reload, works with the back button, and needs no Client
// Component. The first option is the default, which leaves the key out.
export default function QueryChips({
  label,
  heading,
  name,
  options,
  current,
  pathname,
  params,
}) {
  return (
    <nav aria-label={label} className={styles.chips}>
      {heading && <span className={styles.heading}>{heading}</span>}
      {options.map((option, index) => {
        const isActive = option === current;
        return (
          <Link
            key={option.value}
            href={hrefFor(
              pathname,
              params,
              name,
              index === 0 ? null : option.value
            )}
            className={isActive ? styles.active : styles.option}
            aria-current={isActive ? "true" : undefined}
          >
            {option.label}
            {option.count !== undefined && (
              <span className={styles.count}>{option.count}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
