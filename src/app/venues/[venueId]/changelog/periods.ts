/** The change log's "Showing" choices. Shared by the page (server) and its controls (browser). */
export const PERIODS = [
  { id: "today", label: "Today" },
  { id: "week", label: "This week" },
  { id: "month", label: "This month" },
  { id: "all", label: "All time" },
] as const;

export type Period = (typeof PERIODS)[number]["id"];

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
