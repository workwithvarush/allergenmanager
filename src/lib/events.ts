import type { AllergenId } from "@/lib/allergens";
import type { VenueId } from "@/lib/venues";

/** Allergen marking on a dish; absent allergens are simply left out. */
export type AllergenMark = "present" | "may";

export type DietaryTag = "v" | "vg" | "ncgi" | "df" | "halal";

export type Dish = {
  id: string;
  name: string;
  section: string;
  allergens: Partial<Record<AllergenId, AllergenMark>>;
  tags: DietaryTag[];
  mayContain: string;
  complete: boolean;
};

export type AllergenEvent = {
  id: string;
  venueId: VenueId;
  name: string;
  room: string;
  /** ISO date, e.g. "2026-05-20". */
  date: string;
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
export function dishesWithEntries(event: AllergenEvent): number {
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
