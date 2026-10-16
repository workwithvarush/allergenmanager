import { ALLERGENS } from "@/lib/allergens";
import { DIETARY_TAGS } from "@/lib/dietary-tags";
import type { DietaryTag, Dish } from "@/lib/events";
import type { VenueId } from "@/lib/venues";

/** The three printed documents, in tab order. */
export const DOCUMENTS = [
  { id: "sheet", label: "Allergen sheet" },
  { id: "menu", label: "Menu" },
  { id: "placecards", label: "Placecards" },
] as const;

export type DocumentId = (typeof DOCUMENTS)[number]["id"];

export function isDocumentId(value: unknown): value is DocumentId {
  return DOCUMENTS.some((doc) => doc.id === value);
}

/**
 * EMCC prints the formal style (serif titles, black X/M grid, leaf artwork, tags
 * on every document); Bramleys the branded style (forest headings, coloured
 * cells, tags on the menu only) — as in the prototype.
 */
export function printStyle(venueId: VenueId): "formal" | "branded" {
  return venueId === "emcc" ? "formal" : "branded";
}

/** "(V)(VG)" — dietary tags as printed after a dish name. */
export function tagsText(tags: readonly DietaryTag[]): string {
  return tags.map((tag) => `(${DIETARY_TAGS[tag].label})`).join("");
}

/** "Gluten (GF oats), Milk", then notes on allergens that aren't marked — the placecard's Contains line. */
export function containsText(dish: Pick<Dish, "allergens" | "notes">): string {
  const marked = ALLERGENS.filter((a) => dish.allergens[a.id] === "present").map((a) =>
    dish.notes[a.id] ? `${a.label} (${dish.notes[a.id]})` : a.label,
  );
  const noteOnly = ALLERGENS.filter((a) => !dish.allergens[a.id] && dish.notes[a.id]).map((a) => dish.notes[a.id]!);
  return [...marked, ...noteOnly].join(", ");
}

/** The placecard's May contain line: the typed text if any, else the allergens marked "may contain". */
export function mayContainText(dish: Pick<Dish, "allergens" | "notes" | "mayContain">): string {
  if (dish.mayContain.trim()) return dish.mayContain.trim();
  return ALLERGENS.filter((a) => dish.allergens[a.id] === "may")
    .map((a) => (dish.notes[a.id] ? `${a.label} (${dish.notes[a.id]})` : a.label))
    .join(", ");
}

const SECTION_ORDER = ["Starter", "Main", "Side", "Dessert", "AM", "Lunch", "PM", "Other"];

/** Dishes grouped by section in menu order (Starter, Main, … Other), as on the printed menu. */
export function menuSections(dishes: readonly Dish[]): { title: string; dishes: Dish[] }[] {
  const sections = new Map<string, Dish[]>();
  for (const dish of dishes) {
    const title = dish.section || "Other";
    sections.set(title, [...(sections.get(title) ?? []), dish]);
  }
  const rank = (title: string) => {
    const i = SECTION_ORDER.indexOf(title);
    return i === -1 ? SECTION_ORDER.length : i;
  };
  return [...sections].map(([title, list]) => ({ title, dishes: list })).sort((a, b) => rank(a.title) - rank(b.title));
}

export type MenuPageSection = {
  title: string;
  dishes: Dish[];
  /** The section began on an earlier page. */
  continued: boolean;
};

/**
 * The menu's sections split into pages. `breaks` holds the position (in menu
 * order, across sections) of the first dish on each page after the first.
 */
export function menuPages(dishes: readonly Dish[], breaks: readonly number[]): MenuPageSection[][] {
  const ordered = menuSections(dishes).flatMap((section) =>
    section.dishes.map((dish, i) => ({ title: section.title, dish, first: i === 0 })),
  );
  const starts = [0, ...breaks];
  return starts.map((start, p) => {
    const sections: MenuPageSection[] = [];
    for (const item of ordered.slice(start, starts[p + 1] ?? ordered.length)) {
      const last = sections[sections.length - 1];
      if (last?.title === item.title) last.dishes.push(item.dish);
      else sections.push({ title: item.title, dishes: [item.dish], continued: !item.first });
    }
    return sections;
  });
}

/** Splits items into pages of `size`. Always at least one (possibly empty) page. */
export function paginate<T>(items: readonly T[], size: number): T[][] {
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += size) pages.push(items.slice(i, i + size));
  return pages.length > 0 ? pages : [[]];
}

/** Placecards per A4 sheet: 2 × 7 labels of 99.1 × 38.1 mm (standard 14-per-sheet label stock). */
export const PLACECARDS_PER_PAGE = 14;

/**
 * Allergen sheet size tiers, largest first, from the prototype: few dishes print
 * large. The sheet starts at the tier for its dish count and steps down (then
 * splits onto more pages) if long names or a message would push it off the page.
 */
export const SHEET_TIERS = [
  { tier: "large", maxDishes: 5, rowsPerPage: 5 },
  { tier: "medium", maxDishes: 7, rowsPerPage: 7 },
  { tier: "small", maxDishes: Infinity, rowsPerPage: 16 },
] as const;

/** Index into SHEET_TIERS for a dish count. */
export function sheetTierIndex(dishCount: number): number {
  return SHEET_TIERS.findIndex((t) => dishCount <= t.maxDishes);
}
