/** Nottingham Venues sites, in the order the venue picker lists them. */
export const VENUES = [
  {
    id: "emcc",
    name: "EMCC",
    description: "East Midlands Conference Centre · Nottingham Venues",
    available: true,
  },
  {
    id: "bramleys",
    name: "Bramleys",
    description: "Nottingham Venues",
    available: true,
  },
  {
    id: "jubilee",
    name: "Jubilee",
    description: "Nottingham Venues",
    available: false,
    unavailableReason: "No menus loaded yet.",
  },
] as const satisfies readonly Venue[];

export type Venue = {
  id: string;
  name: string;
  description: string;
  available: boolean;
  /** Why the venue can't be opened yet; shown on the card. */
  unavailableReason?: string;
};

export type VenueId = (typeof VENUES)[number]["id"];

/** Rooms offered when creating an event, as in the prototype. */
export const ROOMS = ["CS 1", "CS 2", "CS 3", "CS 4", "Banqueting suite", "Conference theatre", "Concourse", "Atrium"] as const;

/** Bramleys builds every menu dish by dish, so its events always use a custom menu. */
export function usesStandardMenus(venueId: VenueId): boolean {
  return venueId === "emcc";
}
