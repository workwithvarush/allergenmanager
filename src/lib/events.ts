import type { AllergenId } from "@/lib/allergens";
import type { LogEntry } from "@/lib/changelog";
import { formatDayShort } from "@/lib/dates";
import type { VenueId } from "@/lib/venues";

/** Allergen marking on a dish; absent allergens are simply left out. */
export type AllergenMark = "present" | "may";

/** Dietary tags; which ones a venue uses is in dietary-tags.ts ("g" is Bramleys' "Contains Gluten"). */
export type DietaryTag = "v" | "vg" | "ncgi" | "df" | "g" | "halal";

export type Dish = {
  id: string;
  name: string;
  section: string;
  allergens: Partial<Record<AllergenId, AllergenMark>>;
  tags: DietaryTag[];
  mayContain: string;
  /**
   * One-line ingredient notes per allergen, e.g. gluten: "GF oats". A note prints in
   * place of the ✕/M mark and appears in Contains on the placecard.
   */
  notes: Partial<Record<AllergenId, string>>;
  complete: boolean;
};

export type AllergenEvent = {
  id: string;
  venueId: VenueId;
  name: string;
  room: string;
  /** ISO date, e.g. "2026-05-20". */
  date: string;
  /** Last day of an event running over several days; null for a single day. */
  endDate: string | null;
  /** Service time, 24h "HH:mm". */
  time: string;
  guests: number;
  /** Standard menu letter, or null for a custom menu. */
  menuId: string | null;
  /** Name of a custom menu. */
  menuName: string | null;
  dishes: Dish[];
  version: number;
  /** "HH:mm" of the last print, or null if never printed. */
  lastPrintedAt: string | null;
  lastPrintedVersion: number | null;
  lastModifiedAt: string;
  /** Manually flagged for reprint after printing. */
  flagged: boolean;
  /** Free text printed in a box below the allergen sheet, e.g. which kitchen section is nut-free. "" for none. */
  customMessage: string;
  /** Every change, oldest first: who, when and what (the change log). */
  log: LogEntry[];
};

/** Dashboard lanes, as in the prototype's filter chips. */
export type EventLane = "incomplete" | "reprint" | "ready";

export function dishesDone(event: AllergenEvent): number {
  return event.dishes.filter((dish) => dish.complete).length;
}

/** Printed, but edited or flagged since — the printed sheets are out of date. */
export function isChangedSincePrint(event: AllergenEvent): boolean {
  if (!event.lastPrintedAt) return false;
  return event.version !== event.lastPrintedVersion || event.flagged;
}

/** Incomplete until every dish is done; then Reprint if the print is stale, else Ready. */
export function eventLane(event: AllergenEvent): EventLane {
  if (dishesDone(event) < event.dishes.length) return "incomplete";
  return isChangedSincePrint(event) ? "reprint" : "ready";
}

/** Every dish done but never printed — counted as "Pending review" on the dashboard. */
export function isPendingReview(event: AllergenEvent): boolean {
  return dishesDone(event) === event.dishes.length && event.lastPrintedAt === null;
}

/** Dishes with any allergen work on them — what a menu change would throw away. */
export function dishesWithEntries(event: Pick<AllergenEvent, "dishes">): number {
  return event.dishes.filter(
    (dish) => dish.complete || Object.keys(dish.allergens).length > 0 || dish.tags.length > 0 || dish.mayContain,
  ).length;
}

/** Why the event can't be printed yet, or null if it can. */
export function printBlockedReason(event: AllergenEvent): string | null {
  if (event.dishes.some((dish) => !dish.name.trim())) return "Every dish must be named before printing.";
  if (dishesDone(event) < event.dishes.length) return "All dishes must be marked complete before printing.";
  return null;
}

export function sortByServiceTime(events: readonly AllergenEvent[]): AllergenEvent[] {
  return [...events].sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
}

export type TimeToService = {
  text: string;
  /** soon: under an hour · near: under 3h · later · past */
  tone: "soon" | "near" | "later" | "past";
};

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/** "in 45 min", "in 2h 15m", "1h ago" — relative to `now` ("HH:mm"), as in the prototype. */
export function timeToService(serviceTime: string, now: string): TimeToService {
  const diff = toMinutes(serviceTime) - toMinutes(now);
  const span = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h === 0 ? `${m} min` : m ? `${h}h ${m}m` : `${h}h`;
  };
  if (diff < 0) return { text: `${span(-diff)} ago`, tone: "past" };
  if (diff < 60) return { text: `in ${diff} min`, tone: "soon" };
  return { text: `in ${span(diff)}`, tone: diff < 180 ? "near" : "later" };
}

/** Printed, and nothing has changed since — the printed sheets are current. */
export function isPrintedCurrent(event: AllergenEvent): boolean {
  return event.lastPrintedAt !== null && !isChangedSincePrint(event);
}

/** Allergens marked "present" across the events' dishes ("may contain" is not counted). */
export function allergensFlagged(events: readonly AllergenEvent[]): number {
  return events.reduce(
    (sum, event) =>
      sum + event.dishes.reduce((n, dish) => n + Object.values(dish.allergens).filter((m) => m === "present").length, 0),
    0,
  );
}

/** True if the event runs on `isoDate` (multi-day events run on every day in their range). */
export function eventOnDay(event: AllergenEvent, isoDate: string): boolean {
  return isoDate >= event.date && isoDate <= (event.endDate ?? event.date);
}

/** "15 Oct", or "15 Oct – 16 Oct" for a multi-day event. */
export function eventDateLabel(event: AllergenEvent): string {
  const start = formatDayShort(event.date);
  return event.endDate && event.endDate !== event.date ? `${start} – ${formatDayShort(event.endDate)}` : start;
}

/**
 * The menu's name as it was when the event took it on (renaming a menu later
 * doesn't relabel old events), e.g. "Menu A" or a custom menu's name.
 */
export function menuLabel(event: Pick<AllergenEvent, "menuId" | "menuName" | "dishes">): string {
  if (event.menuName) return event.menuName;
  return event.menuId ? `Menu ${event.menuId}` : `${event.dishes.length} dishes`;
}

export const MAX_DISH_NAME = 120;

/** Ingredient notes are one line, e.g. "GF oats". */
export const MAX_NOTE = 40;
/** Longer notes still print, but shrink the printed matrix (prototype guidance). */
export const SHORT_NOTE = 12;

/**
 * Why a dish can't be marked complete yet, or null if it can: it needs a name,
 * and no ticked dietary tag may contradict its allergens (pass the conflicts in).
 */
export function completeBlockedReason(dish: Pick<Dish, "name">, tagConflicts: readonly string[]): string | null {
  if (!dish.name.trim()) return "The dish needs a name before it can be marked complete.";
  if (tagConflicts.length > 0) {
    return `${tagConflicts.join(" and ")} ${tagConflicts.length === 1 ? "contradicts" : "contradict"} the allergens — the tag must be removed or an ingredient note added first.`;
  }
  return null;
}

/** The additional message is a short note, not a document. */
export const MAX_MESSAGE = 300;
