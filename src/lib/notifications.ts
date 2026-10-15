import { addDays } from "@/lib/dates";
import { getAllEvents, getSeenAlerts } from "@/lib/demo-data";
import type { SessionUser } from "@/lib/session";
import { venueDate } from "@/lib/venue-time";
import type { VenueId } from "@/lib/venues";

/** A change to an event after it was printed — its printed sheets are now out of date. */
export type PostPrintAlert = {
  id: string;
  eventId: string;
  eventName: string;
  text: string;
  /** UK local time, "2026-10-15T11:05". */
  at: string;
  person: string;
  role: string;
  /** Not yet seen by this person (their own changes never count as unread). */
  unread: boolean;
};

export type PostPrintAlerts = { items: PostPrintAlert[]; unread: number };

/** How far back the bell looks, and how many it lists (the prototype kept 40). */
const DAYS = 14;
const LIMIT = 40;

/**
 * The bell's list, as in the prototype: changes made to printed events (the
 * change log's amber entries), newest first.
 */
export async function postPrintAlerts(venueId: VenueId, user: SessionUser): Promise<PostPrintAlerts> {
  const since = addDays(venueDate(new Date()), -DAYS);
  const seen = await getSeenAlerts(user.email, venueId);
  const items = (await getAllEvents(venueId))
    .flatMap((event) =>
      event.log
        .filter((entry) => entry.type === "warn" && entry.at.slice(0, 10) >= since)
        .map((entry) => ({
          id: entry.id,
          eventId: event.id,
          eventName: event.name,
          text: entry.text,
          at: entry.at,
          person: entry.name,
          role: entry.role,
          unread: !seen.has(entry.id) && entry.email !== user.email,
        })),
    )
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, LIMIT);
  return { items, unread: items.filter((i) => i.unread).length };
}
