import { addDays, monthOf, weekdayIndex } from "@/lib/dates";

/** The change log's "Showing" choices. Shared by the page (server) and its controls (browser). */
export const PERIODS = [
  { id: "today", label: "Today" },
  { id: "week", label: "This week" },
  { id: "month", label: "This month" },
  { id: "all", label: "All time" },
] as const;

export type Period = (typeof PERIODS)[number]["id"];

/** As in the prototype, the change log opens on this month. */
export const DEFAULT_PERIOD: Period = "month";

/**
 * First day a period covers, or null for all time. Calendar periods, so they
 * mean what they say: this week from Monday, this month from the 1st (the
 * same span as the monthly change log archive). The prototype counted back 6
 * and 30 days instead.
 */
export function periodStart(period: Period, today: string): string | null {
  switch (period) {
    case "today":
      return today;
    case "week":
      return addDays(today, -weekdayIndex(today));
    case "month":
      return `${monthOf(today)}-01`;
    case "all":
      return null;
  }
}

/** Longest search kept from the URL. */
export const MAX_SEARCH = 100;

/**
 * True if every word of the search appears somewhere in the entry — its text,
 * person, role or event — ignoring case. "milk cake" finds "Chocolate cake — Milk added".
 */
export function matchesSearch(search: string, fields: readonly string[]): boolean {
  const haystack = fields.join(" ").toLocaleLowerCase("en-GB");
  return search
    .toLocaleLowerCase("en-GB")
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word));
}

/** The Filters panel's fields, in order (prototype: Person, Role, Event). */
export const FILTER_KEYS = ["person", "role", "event"] as const;
export type FilterKey = (typeof FILTER_KEYS)[number];

export const FILTER_LABELS: Record<FilterKey, string> = { person: "Person", role: "Role", event: "Event" };

/** The chosen value for each filter; "" for all. */
export type Filters = Record<FilterKey, string>;

export type FilterOption = { value: string; label: string };
export type FilterOptions = Record<FilterKey, FilterOption[]>;
