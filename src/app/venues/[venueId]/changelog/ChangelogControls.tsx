"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useRef, useState, useTransition } from "react";
import { Button } from "@/components/Button";
import styles from "./Changelog.module.css";
import {
  FILTER_KEYS,
  FILTER_LABELS,
  MAX_SEARCH,
  PERIODS,
  type FilterOptions,
  type Filters,
  type Period,
} from "./periods";

/** Typing pauses this long before the list is searched. */
const SEARCH_DELAY_MS = 300;

type ChangelogControlsProps = {
  /** The search as in the URL ("" for none). */
  search: string;
  period: Period;
  /** The venue shown, or null for roles that only see their own venue. */
  venue: string | null;
  /** Every venue; unavailable ones are listed but can't be chosen. */
  venues: { id: string; name: string; available: boolean }[];
  /** Person, role and event filters as applied ("" for all). */
  filters: Filters;
  options: FilterOptions;
};

/**
 * Search, "Showing" period and (Supervisor, F&B Manager) venue, as in the
 * prototype's toolbar. All are kept in the URL so reload, Back and shared links keep them.
 */
export function ChangelogControls({ search, period, venue, venues, filters, options }: ChangelogControlsProps) {
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

  /** Sets URL params ("" removes one) and reloads the list. */
  const setMany = (values: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(values)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    const query = params.toString();
    startTransition(() => router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false }));
  };
  const set = (key: string, value: string) => setMany({ [key]: value });

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
              <option key={v.id} value={v.id} disabled={!v.available}>
                {v.available ? v.name : `${v.name} — coming soon`}
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
      <FilterPanel filters={filters} options={options} onApply={setMany} />
    </div>
  );
}

const ALL_FILTERS: Filters = { person: "", role: "", event: "" };

/**
 * The prototype's Filters button and pop-over: Person, Role and Event, changed
 * together and applied with Apply. Clear resets them at once. Esc or a click
 * elsewhere closes it.
 */
function FilterPanel({
  filters,
  options,
  onApply,
}: {
  filters: Filters;
  options: FilterOptions;
  onApply: (values: Filters) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(filters);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const active = FILTER_KEYS.filter((key) => filters[key]).length;

  const close = (returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) buttonRef.current?.focus();
  };

  // Focus the first field on opening; a click outside closes without moving focus.
  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector("select")?.focus();
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!panelRef.current?.contains(target) && !buttonRef.current?.contains(target)) close(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  return (
    <div className={styles.filters}>
      <button
        ref={buttonRef}
        type="button"
        className={styles.filtersButton}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => {
          if (open) return close(false);
          setDraft(filters);
          setOpen(true);
        }}
      >
        Filters
        {active > 0 && (
          <span className={styles.filtersCount}>
            {active}
            <span className="sr-only"> active</span>
          </span>
        )}
      </button>
      {open && (
        <div
          ref={panelRef}
          id={panelId}
          role="group"
          aria-label="Filters"
          className={styles.filtersPanel}
          onKeyDown={(e) => {
            if (e.key !== "Escape") return;
            e.preventDefault();
            close(true);
          }}
        >
          {FILTER_KEYS.map((key) => (
            <label key={key} className={styles.filterField}>
              <span className={styles.controlLabel}>{FILTER_LABELS[key]}</span>
              <select
                className={styles.select}
                value={draft[key]}
                onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}
              >
                <option value="">All</option>
                {options[key].map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          ))}
          <div className={styles.filtersFoot}>
            <Button
              variant="secondary"
              className="btn-sm"
              onClick={() => {
                setDraft(ALL_FILTERS);
                onApply(ALL_FILTERS);
              }}
            >
              Clear
            </Button>
            <Button
              className="btn-sm"
              onClick={() => {
                onApply(draft);
                close(true);
              }}
            >
              Apply
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
