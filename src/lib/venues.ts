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
