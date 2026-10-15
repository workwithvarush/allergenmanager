/** Which page a tour step shows; the tour navigates there before highlighting. */
export type TourScreen = "dashboard" | "entry" | "print" | "changelog" | "archive";

export type TourStep = {
  /** The highlighted element carries data-tour="…". */
  target: string;
  screen: TourScreen;
  /** Where the card sits relative to the highlight, when there's room. */
  place: "below" | "above" | "right";
  /** Only for roles with this permission. */
  need?: "create" | "archive";
  title: string;
  body: string;
  points: string[];
};

/**
 * The prototype's tutorial, step for step. Changes: the calendar is its own
 * page here; the bell doesn't claim alerts are emailed (nothing is sent yet);
 * the change log mentions search.
 */
export const TOUR_STEPS: TourStep[] = [
  {
    target: "nav-dashboard",
    screen: "dashboard",
    place: "below",
    title: "Dashboard",
    body: "Every event for the venue today, with status, dish progress and the last print stamp.",
    points: ["Incomplete, Reprint and Ready filters sit above the list"],
  },
  {
    target: "event-rows",
    screen: "dashboard",
    place: "right",
    title: "Event list",
    body: "Click an event to select it. The panel on the right shows its menu, progress and actions.",
    points: ["The badge shows whether it is ready, incomplete or needs a reprint"],
  },
  {
    target: "today",
    screen: "dashboard",
    place: "below",
    title: "Calendar",
    body: "Opens the month calendar so you can reach events on any other date.",
    points: ["Click a day to see its events", "Click an event in the calendar to open it"],
  },
  {
    target: "new-event",
    screen: "dashboard",
    place: "below",
    need: "create",
    title: "New event",
    body: "Names the event, sets room, time and guest count, and assigns a menu.",
    points: ["Pick a standard menu or build a custom one dish by dish"],
  },
  {
    target: "allergen-grid",
    screen: "entry",
    place: "below",
    title: "Allergen grid",
    body: "One cell per statutory allergen. Click a cell to cycle none → contains → may contain.",
    points: ["Contains prints as X, may contain prints as M"],
  },
  {
    target: "cell-note",
    screen: "entry",
    place: "below",
    title: "Ingredient note",
    body: "The pencil adds a one-line note to that allergen, e.g. GF oats.",
    points: ["The note prints in place of the mark", "A note unblocks a conflicting tag, e.g. gluten note with NCGI"],
  },
  {
    target: "mark-complete",
    screen: "entry",
    place: "above",
    title: "Mark complete",
    body: "Marks the dish finished. All dishes must be complete and named before the event can print.",
    points: ["Progress is counted at the top of the screen"],
  },
  {
    target: "entry-print",
    screen: "entry",
    place: "below",
    title: "Preview and print",
    body: "Moves to the preview once every dish is complete.",
    points: ["Disabled while any dish is unnamed or in progress"],
  },
  {
    target: "preview-tabs",
    screen: "print",
    place: "below",
    title: "Preview",
    body: "The three printed documents exactly as they will come out, each carrying the version stamp.",
    points: ["Allergen sheet · Menu · Placecards", "The additional message can be edited here before printing"],
  },
  {
    target: "print-now",
    screen: "print",
    place: "below",
    title: "Print all 3 documents",
    body: "Prints the sheet, menu and placecards together and records the version printed.",
    points: ["Gold is used only for the print action"],
  },
  {
    target: "bell",
    screen: "print",
    place: "below",
    title: "Post-print changes",
    body: "Any edit made to an event after it was printed is listed here, so the old sheets can be replaced.",
    points: ["Click an alert to open that event's preview", "Flag for reprint tells FOH to pull the old sheet"],
  },
  {
    target: "nav-changelog",
    screen: "dashboard",
    place: "below",
    title: "Change log",
    body: "Every edit across the venue, with who made it and when.",
    points: ["Search, or filter by person, role or event"],
  },
  {
    target: "nav-archive",
    screen: "dashboard",
    place: "below",
    need: "archive",
    title: "Archive",
    body: "Printed records kept for compliance, downloadable per month.",
    points: ["Not available to allergen members"],
  },
  {
    target: "help",
    screen: "dashboard",
    place: "below",
    title: "That's the tour",
    body: "Reopen this walkthrough any time from the ? in the top bar.",
    points: [],
  },
];
