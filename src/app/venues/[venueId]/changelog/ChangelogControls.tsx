"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useRef, useState, useTransition } from "react";
import styles from "./Changelog.module.css";
import { MAX_SEARCH, PERIODS, type Period } from "./periods";

/** Typing pauses this long before the list is searched. */
const SEARCH_DELAY_MS = 300;

type ChangelogControlsProps = {
  /** The search as in the URL ("" for none). */
  search: string;
  period: Period;
  /** The venue shown, or null for roles that only see their own venue. */
  venue: string | null;
  venues: { id: string; name: string }[];
};

/**
 * Search, "Showing" period and (Supervisor, F&B Manager) venue, as in the
 * prototype's toolbar. All are kept in the URL so reload, Back and shared links keep them.
 */
export function ChangelogControls({ search, period, venue, venues }: ChangelogControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const searchId = useId();
  const periodId = useId();
  const venueId = useId();
  const [text, setText] = useState(search);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Follow the URL when it changes from outside (e.g. Back), unless a search is being typed.
  const [lastSearch, setLastSearch] = useState(search);
  if (search !== lastSearch) {
    setLastSearch(search);
    setText(search);
  }

  useEffect(() => () => clearTimeout(timer.current ?? undefined), []);

  const set = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    const query = params.toString();
    startTransition(() => router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false }));
  };

  const searchNow = (value: string) => {
    clearTimeout(timer.current ?? undefined);
    timer.current = null;
    if (value.trim() !== search) set("q", value.trim());
  };

  const changeText = (value: string) => {
    setText(value);
    clearTimeout(timer.current ?? undefined);
    timer.current = setTimeout(() => searchNow(value), SEARCH_DELAY_MS);
  };

  return (
    <div className={styles.toolbar} aria-busy={pending || undefined}>
      <div className={styles.search} role="search">
        <label htmlFor={searchId} className="sr-only">
          Search the change log
        </label>
        <input
          id={searchId}
          type="search"
          className={styles.searchInput}
          value={text}
          onChange={(e) => changeText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && searchNow(text)}
          placeholder="Search entries, people or dishes"
          maxLength={MAX_SEARCH}
          autoComplete="off"
        />
      </div>
      {venue !== null && (
        <div className={styles.control}>
          <label htmlFor={venueId} className={styles.controlLabel}>
            Venue
          </label>
          <select id={venueId} className={styles.select} value={venue} onChange={(e) => set("venue", e.target.value)}>
            {venues.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
            <option value="all">All venues</option>
          </select>
        </div>
      )}
      <div className={styles.control}>
        <label htmlFor={periodId} className={styles.controlLabel}>
          Showing
        </label>
        <select id={periodId} className={styles.select} value={period} onChange={(e) => set("period", e.target.value)}>
          {PERIODS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
