import type { LogActor, LogEntry } from "@/lib/changelog";
import { daysOfMonth, formatDayShort } from "@/lib/dates";
import { menuLabel, type AllergenEvent } from "@/lib/events";
import type { VenueId } from "@/lib/venues";

/** One event's section in an archive: its details then, and its change log entries for the month. */
export type ArchiveGroup = {
  eventId: string;
  name: string;
  /** e.g. "15 Oct · CS 3 · 13:00 · 60 guests · Menu C". */
  meta: string;
  /** e.g. "v5 · printed 11:20" or "v2 · not printed". */
  stamp: string;
  entries: LogEntry[];
};

/**
 * A monthly change log record. Fixed when generated — later edits to events
 * don't change it — so it can stand as the venue's record of allergen changes.
 */
export type ArchiveRecord = {
  id: string;
  venueId: VenueId;
  /** "2026-10". */
  month: string;
  /** "EMCC-CL-2026-10". */
  ref: string;
  /** UK local time it was generated, "2026-10-15T14:02". */
  generatedAt: string;
  /** First and last day covered (ISO dates). */
  from: string;
  to: string;
  /** Generated before month end, so it covers only part of the month. */
  partial: boolean;
  issuedBy: LogActor;
  groups: ArchiveGroup[];
};

/** Short venue codes for archive references, from the prototype. */
const VENUE_CODES: Record<VenueId, string> = { emcc: "EMCC", bramleys: "BRAM", jubilee: "JUB" };

export function archiveRef(venueId: VenueId, month: string): string {
  return `${VENUE_CODES[venueId]}-CL-${month}`;
}

/** The last day of a month, e.g. "2026-10-31" — when its archive issues automatically. */
export function monthEnd(month: string): string {
  const days = daysOfMonth(month);
  return days[days.length - 1];
}

/**
 * The month's change log, frozen: every event with entries from `from` to `to`
 * (inclusive), oldest entry first, as in the prototype's archive.
 */
export function archiveGroups(events: readonly AllergenEvent[], from: string, to: string): ArchiveGroup[] {
  return events
    .map((event) => ({
      eventId: event.id,
      name: event.name,
      meta: `${formatDayShort(event.date)} · ${event.room} · ${event.time} · ${event.guests} guests · ${menuLabel(event)}`,
      stamp: `v${event.version} · ${event.lastPrintedAt ? `printed ${event.lastPrintedAt}` : "not printed"}`,
      entries: event.log
        .filter((entry) => entry.at.slice(0, 10) >= from && entry.at.slice(0, 10) <= to)
        .sort((a, b) => a.at.localeCompare(b.at)),
    }))
    .filter((group) => group.entries.length > 0)
    .sort((a, b) => a.entries[0].at.localeCompare(b.entries[0].at));
}

export type ArchiveBlock =
  | { kind: "heading"; group: ArchiveGroup; continued: boolean }
  | { kind: "entry"; entry: LogEntry };

/**
 * Splits the archive's groups over A4 pages, as the prototype does: estimated
 * heights (px at 96dpi) against the space between page header and footer. An
 * event's heading repeats with "(continued)" when its entries run onto a new page.
 * Long entries are allowed extra lines, so the estimate errs on the safe side.
 */
export function paginateArchive(groups: readonly ArchiveGroup[]): ArchiveBlock[][] {
  // Measured on the rendered page: 942px between header and footer, headings 54px
  // (+22px gap), entries 53px per line of about 82 characters plus 24px for each further line.
  const LIMIT = 920;
  const HEADING = 54;
  const GAP = 22;
  const entryHeight = (entry: LogEntry) => {
    const characters = entry.name.length + entry.role.length + entry.text.length + 4;
    return 53 + Math.max(0, Math.ceil(characters / 82) - 1) * 24;
  };

  const pages: ArchiveBlock[][] = [];
  let page: ArchiveBlock[] = [];
  let used = 0;
  const newPage = () => {
    if (page.length) pages.push(page);
    page = [];
    used = 0;
  };

  for (const group of groups) {
    const gap = page.length ? GAP : 0;
    // Keep a heading with at least its first entry.
    if (used + gap + HEADING + entryHeight(group.entries[0]) > LIMIT) newPage();
    used += (page.length ? GAP : 0) + HEADING;
    page.push({ kind: "heading", group, continued: false });
    for (const entry of group.entries) {
      const height = entryHeight(entry);
      if (used + height > LIMIT) {
        newPage();
        page.push({ kind: "heading", group, continued: true });
        used = HEADING;
      }
      page.push({ kind: "entry", entry });
      used += height;
    }
  }
  newPage();
  return pages;
}

/** Figures for the archive's cover, as in the prototype. */
export function archiveSummary(archive: ArchiveRecord) {
  const entries = archive.groups.flatMap((g) => g.entries);
  const contributors = [...new Set(entries.filter((e) => e.role !== "Automatic").map((e) => e.name))];
  return { entries: entries.length, events: archive.groups.length, contributors, postPrint: entries.filter((e) => e.type === "warn").length, prints: entries.filter((e) => e.type === "print").length };
}

/** "15 October" for "2026-10-15". */
export function dayMonth(isoDate: string): string {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", timeZone: "UTC" }).format(
    new Date(`${isoDate}T00:00:00Z`),
  );
}

/** Wording for generating this month's archive early on `today`: "1–15 October", issued "31 October". */
export function earlyArchiveWording(today: string): { coverage: string; issueDay: string } {
  return { coverage: `1–${dayMonth(today)}`, issueDay: dayMonth(monthEnd(today.slice(0, 7))) };
}
