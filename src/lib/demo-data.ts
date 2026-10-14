/**
 * DEMO DATA — sample events until there is a backend. The prototype starts
 * with no events, so these are made up to show every dashboard state, using
 * the prototype's standard menus. Completed dishes carry the allergens and
 * tags recorded on their menu.
 */
import type { AllergenEvent, Dish } from "@/lib/events";
import { findMenu, instantiateMenu } from "@/lib/menus";
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
    complete: i < completeCount,
  }));
}

type Seed = Omit<AllergenEvent, "date" | "venueId" | "lastModifiedAt" | "flagged"> & { flagged?: boolean };

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
  ],
  jubilee: [],
};

/** Today's sample events for a venue. Replace with a real data source. */
export async function getEventsForDay(venueId: VenueId, date: string): Promise<AllergenEvent[]> {
  return SEEDS[venueId].map(({ flagged = false, ...seed }) => ({
    ...seed,
    venueId,
    date,
    flagged,
    lastModifiedAt: seed.lastPrintedAt ?? "09:00",
  }));
}
