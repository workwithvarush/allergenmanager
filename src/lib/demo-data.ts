/**
 * DEMO DATA — sample events until there is a backend. The prototype starts
 * with no events, so these are made up to show every dashboard state, plus a few on other days for the calendar, using
 * the prototype's standard menus. Completed dishes carry the allergens and
 * tags recorded on their menu.
 */
import { makeLogEntry, type LogActor, type LogEntry } from "@/lib/changelog";
import { addDays } from "@/lib/dates";
import type { AllergenEvent, Dish } from "@/lib/events";
import { findMenu, instantiateMenu } from "@/lib/menus";
import { venueDate } from "@/lib/venue-time";
import type { VenueId } from "@/lib/venues";

/** A standard menu's dishes; the first `completeCount` are complete, with the menu's recorded allergens. */
function dishes(menuId: string, completeCount: number): Dish[] {
  const menu = findMenu(menuId)!;
  return instantiateMenu(menu).map((dish, i) =>
    i < completeCount
      ? { ...dish, complete: true, allergens: { ...menu.dishes[i].allergens }, tags: [...(menu.dishes[i].tags ?? [])] }
      : dish,
  );
}

/** A custom menu (Bramleys builds its own); the first `completeCount` dishes are complete. */
function customDishes(items: [name: string, allergens: Dish["allergens"]][], completeCount: number): Dish[] {
  return items.map(([name, allergens], i) => ({
    id: `d${i + 1}`,
    section: "Dish",
    name,
    allergens: i < completeCount ? allergens : {},
    tags: [],
    mayContain: "",
    notes: {},
    complete: i < completeCount,
  }));
}

/** Sample staff, from the prototype's change log. */
const PEOPLE = {
  priya: { name: "Priya Nair", role: "F&B Manager", email: "p.nair@nottinghamvenues.com" },
  sam: { name: "Sam Okafor", role: "Supervisor", email: "s.okafor@nottinghamvenues.com" },
  ellis: { name: "Ellis Ward", role: "Allergen Member", email: "e.ward@nottinghamvenues.com" },
} satisfies Record<string, LogActor>;

/**
 * A believable history for a sample event: created two days before, a few
 * dishes completed, printed, then any post-print change or reprint flag.
 */
function seedLog(event: Omit<AllergenEvent, "log">, today: string): LogEntry[] {
  // Changes happen on the day of the event, or today for events still to come.
  const day = event.date < today ? event.date : today;
  const at = (date: string, time: string) => `${date}T${time}`;
  const menu = event.menuId ? `Menu ${event.menuId} assigned` : `${event.menuName} · ${event.dishes.length} dishes to configure`;
  const log = [makeLogEntry(PEOPLE.sam, "edit", `Event created — ${menu}`, at(addDays(day, -2), "16:30"))];
  const complete = event.dishes.filter((d) => d.complete);
  complete.slice(0, 3).forEach((dish, i) => {
    log.push(makeLogEntry(PEOPLE.ellis, "edit", `${dish.name} — marked complete`, at(day, `08:${10 + i * 7}`)));
  });
  if (complete.length > 3) {
    const more = complete.length - 3;
    log.push(
      makeLogEntry(PEOPLE.ellis, "edit", `${more} more ${more === 1 ? "dish" : "dishes"} marked complete`, at(day, "08:40")),
    );
  }
  if (event.lastPrintedAt && event.lastPrintedVersion !== null) {
    log.push(
      makeLogEntry(PEOPLE.priya, "print", `Printed all 3 documents · v${event.lastPrintedVersion}`, at(day, event.lastPrintedAt)),
    );
    if (event.version !== event.lastPrintedVersion) {
      const dish = event.dishes[event.dishes.length - 1];
      log.push(makeLogEntry(PEOPLE.sam, "warn", `${dish.name} — Milk moved to may contain`, at(day, "11:05")));
    }
    if (event.flagged) log.push(makeLogEntry(PEOPLE.sam, "warn", "Flagged for reprint", at(day, "11:20")));
  }
  // Stable ids: the sample history is rebuilt on every read.
  return log.map((entry, i) => ({ ...entry, id: `${event.id}-seed-${i}` }));
}

type Seed = Omit<
  AllergenEvent,
  "date" | "endDate" | "venueId" | "lastModifiedAt" | "flagged" | "customMessage" | "log"
> & {
  flagged?: boolean;
  /** Days from today (negative for past events); 0 when left out. */
  day?: number;
  /** Number of days for an event running over several days; 1 when left out. */
  days?: number;
};

const SEEDS: Record<VenueId, Seed[]> = {
  emcc: [
    {
      id: "emcc-nhs-breakfast", name: "Regional NHS Leadership Breakfast", room: "Conference theatre", time: "08:00",
      guests: 80, menuId: "B", menuName: null, dishes: dishes("B", 7), version: 3, lastPrintedAt: null, lastPrintedVersion: null,
    },
    {
      id: "emcc-tech-summit", name: "Nottingham Tech Summit", room: "CS 1", time: "12:30",
      guests: 140, menuId: "A", menuName: null, dishes: dishes("A", 5), version: 6, lastPrintedAt: null, lastPrintedVersion: null,
    },
    {
      id: "emcc-insurance-agm", name: "Midlands Insurance AGM", room: "CS 3", time: "13:00",
      guests: 60, menuId: "C", menuName: null, dishes: dishes("C", 7), version: 4, lastPrintedAt: "11:20", lastPrintedVersion: 4,
    },
    {
      id: "emcc-schools-awards", name: "East Midlands Schools Awards", room: "Banqueting suite", time: "18:30",
      guests: 220, menuId: "A", menuName: null, dishes: dishes("A", 9), version: 5, lastPrintedAt: "10:05", lastPrintedVersion: 3,
    },
    {
      id: "emcc-alumni-evening", name: "University Alumni Street Food Evening", room: "Atrium", time: "19:30",
      guests: 150, menuId: "D", menuName: null, dishes: dishes("D", 2), version: 2, lastPrintedAt: null, lastPrintedVersion: null,
    },
    // Other days, so the calendar has something to show. Past events were printed; future ones are still being filled in.
    {
      id: "emcc-property-awards", day: -6, name: "Midlands Property Awards", room: "Banqueting suite", time: "19:00",
      guests: 180, menuId: "A", menuName: null, dishes: dishes("A", 9), version: 2, lastPrintedAt: "16:10", lastPrintedVersion: 2,
    },
    {
      id: "emcc-primary-care", day: -2, name: "Primary Care Training Day", room: "CS 2", time: "09:30",
      guests: 45, menuId: "B", menuName: null, dishes: dishes("B", 7), version: 3, lastPrintedAt: "08:40", lastPrintedVersion: 3,
    },
    {
      id: "emcc-law-society", day: 1, name: "Nottingham Law Society Lunch", room: "CS 3", time: "12:30",
      guests: 50, menuId: "C", menuName: null, dishes: dishes("C", 4), version: 2, lastPrintedAt: null, lastPrintedVersion: null,
    },
    {
      id: "emcc-pitch-night", day: 1, name: "Startup Pitch Night", room: "Atrium", time: "18:00",
      guests: 90, menuId: "D", menuName: null, dishes: dishes("D", 0), version: 1, lastPrintedAt: null, lastPrintedVersion: null,
    },
    {
      id: "emcc-robotics", day: 3, days: 2, name: "UK Robotics Conference", room: "Conference theatre", time: "09:00",
      guests: 300, menuId: "A", menuName: null, dishes: dishes("A", 0), version: 1, lastPrintedAt: null, lastPrintedVersion: null,
    },
    {
      id: "emcc-graduate-fair", day: 8, name: "Graduate Recruitment Fair", room: "Concourse", time: "11:00",
      guests: 120, menuId: "B", menuName: null, dishes: dishes("B", 0), version: 1, lastPrintedAt: null, lastPrintedVersion: null,
    },
    {
      id: "emcc-autumn-gala", day: 15, name: "Autumn Charity Gala", room: "Banqueting suite", time: "19:30",
      guests: 250, menuId: "A", menuName: null, dishes: dishes("A", 0), version: 1, lastPrintedAt: null, lastPrintedVersion: null,
    },
  ],
  bramleys: [
    {
      id: "bramleys-wedding", name: "Patel–Hughes Wedding Lunch", room: "Concourse", time: "13:30",
      guests: 95, menuId: null, menuName: "Wedding breakfast", version: 2, lastPrintedAt: null, lastPrintedVersion: null,
      dishes: customDishes(
        [
          ["Beetroot & goat's cheese tart", { gluten: "present", milk: "present", eggs: "present" }],
          ["Chicken supreme, thyme jus", { celery: "present" }],
          ["Wild mushroom risotto", { milk: "present", celery: "may" }],
          ["Lemon posset", { milk: "present" }],
          ["", {}],
        ],
        3,
      ),
    },
    {
      id: "bramleys-charity", name: "Charity Quiz Night", room: "Atrium", time: "19:00",
      guests: 70, menuId: null, menuName: "Quiz night buffet", version: 3, lastPrintedAt: "09:40", lastPrintedVersion: 3,
      flagged: true,
      dishes: customDishes(
        [
          ["Sausage rolls", { gluten: "present", eggs: "present" }],
          ["Vegetable samosas", { gluten: "present", mustard: "may" }],
          ["Cheese & onion sandwiches", { gluten: "present", milk: "present" }],
          ["Brownies", { gluten: "present", eggs: "present", milk: "present", "tree-nuts": "may" }],
        ],
        4,
      ),
    },
    {
      id: "bramleys-book-club", day: -4, name: "Book Club Supper", room: "Atrium", time: "18:30",
      guests: 30, menuId: "C", menuName: null, dishes: dishes("C", 7), version: 2, lastPrintedAt: "15:00", lastPrintedVersion: 2,
    },
    {
      id: "bramleys-retirement", day: 2, name: "Retirement Lunch", room: "Concourse", time: "12:00",
      guests: 40, menuId: "C", menuName: null, dishes: dishes("C", 0), version: 1, lastPrintedAt: null, lastPrintedVersion: null,
    },
    {
      id: "bramleys-party-tasting", day: 10, name: "Christmas Party Tasting", room: "Atrium", time: "19:00",
      guests: 60, menuId: "D", menuName: null, dishes: dishes("D", 0), version: 1, lastPrintedAt: null, lastPrintedVersion: null,
    },
  ],
  jubilee: [],
};

/**
 * Sample events running on any day from `from` to `to` (ISO dates), placed
 * around today in UK time. Replace with a real data source.
 */
export async function getEventsBetween(venueId: VenueId, from: string, to: string): Promise<AllergenEvent[]> {
  return allEvents(venueId).filter((event) => event.date <= to && (event.endDate ?? event.date) >= from);
}

/** Every event at the venue, on any date — e.g. to gather the change log. */
export async function getAllEvents(venueId: VenueId): Promise<AllergenEvent[]> {
  return allEvents(venueId);
}

/** One event, or undefined if the venue has no event with that id. */
export async function getEvent(venueId: VenueId, eventId: string): Promise<AllergenEvent | undefined> {
  return allEvents(venueId).find((event) => event.id === eventId);
}

/**
 * Events created or edited in the app, by id, held in server memory: shared by
 * everyone using this server and lost when it restarts. Kept on globalThis so
 * a dev-server reload doesn't drop them.
 */
const savedEvents: Map<string, AllergenEvent> = ((globalThis as { __demoSavedEvents?: Map<string, AllergenEvent> })
  .__demoSavedEvents ??= new Map());

/** Stores a new or changed event. Replace with a database write. */
export async function saveEvent(event: AllergenEvent): Promise<void> {
  savedEvents.set(event.id, structuredClone(event));
}

/** The venue's sample events (with any saved changes) plus events created in the app. */
function allEvents(venueId: VenueId): AllergenEvent[] {
  const today = venueDate(new Date());
  const seeded = SEEDS[venueId].map(({ flagged = false, day = 0, days = 1, ...seed }) => {
    const event = {
      ...seed,
      venueId,
      date: addDays(today, day),
      endDate: days > 1 ? addDays(today, day + days - 1) : null,
      flagged,
      lastModifiedAt: seed.lastPrintedAt ?? "09:00",
      customMessage: "",
    };
    return { ...event, log: seedLog(event, today) };
  });
  const seededIds = new Set(seeded.map((event) => event.id));
  const created = [...savedEvents.values()].filter((e) => e.venueId === venueId && !seededIds.has(e.id));
  // Copies, so callers can't change what's stored without saving. Events saved before
  // dishes had notes, or events had a message, get empty ones.
  const withSaved = seeded.map((event) => {
    const saved = savedEvents.get(event.id);
    // Events saved before the change log existed keep their sample history.
    return saved ? { ...saved, log: saved.log ?? event.log } : event;
  });
  return [...withSaved, ...created].map((e) => {
    const copy = structuredClone(e);
    copy.customMessage ??= "";
    copy.log ??= [];
    copy.dishes = copy.dishes.map((dish) => ({ ...dish, notes: dish.notes ?? {} }));
    return copy;
  });
}

/** Sample events running on `date`. */
export function getEventsForDay(venueId: VenueId, date: string): Promise<AllergenEvent[]> {
  return getEventsBetween(venueId, date, date);
}
