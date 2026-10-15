import { allergenLabel, type AllergenId } from "@/lib/allergens";
import type { DietaryTag, Dish } from "@/lib/events";
import type { VenueId } from "@/lib/venues";

/** Short label (as printed) and full name of each tag, from the prototype's legend. */
export const DIETARY_TAGS: Record<DietaryTag, { label: string; name: string }> = {
  v: { label: "V", name: "Vegetarian" },
  vg: { label: "VG", name: "Vegan" },
  ncgi: { label: "NCGI", name: "Not Containing Gluten Ingredients" },
  df: { label: "DF", name: "Dairy Free" },
  g: { label: "G", name: "Contains Gluten" },
  halal: { label: "HALAL", name: "Halal" },
};

/** The tags each venue uses, in the order they appear, as in the prototype. */
const TAGS_BY_VENUE: Record<VenueId, readonly DietaryTag[]> = {
  emcc: ["v", "vg", "ncgi", "df", "halal"],
  bramleys: ["v", "vg", "g", "halal"],
  jubilee: ["v", "vg", "ncgi", "df", "halal"],
};

export function venueTags(venueId: VenueId): readonly DietaryTag[] {
  return TAGS_BY_VENUE[venueId];
}

/**
 * Allergens that rule a tag out when marked "contains", as in the prototype:
 * NCGI can't contain gluten; vegan can't contain eggs or milk. The prototype also
 * blocks Dairy Free for eggs, but eggs aren't dairy, so only milk blocks it here.
 */
const CONFLICTS: Partial<Record<DietaryTag, readonly AllergenId[]>> = {
  ncgi: ["gluten"],
  vg: ["eggs", "milk"],
  df: ["milk"],
};

/**
 * Why the tag contradicts the dish's allergens, or null if it doesn't — e.g.
 * "Gluten is marked as contains". "May contain" doesn't conflict: it is a
 * cross-contamination warning, not an ingredient. As in the prototype, an
 * ingredient note on the allergen (e.g. gluten: "GF oats") lifts the conflict.
 */
export function tagConflict(tag: DietaryTag, dish: Pick<Dish, "allergens" | "notes">): string | null {
  const clash = (CONFLICTS[tag] ?? []).filter(
    (allergen) => dish.allergens[allergen] === "present" && !dish.notes[allergen],
  );
  if (clash.length === 0) return null;
  const names = clash.map(allergenLabel).join(" and ");
  return `${names} ${clash.length === 1 ? "is" : "are"} marked as contains with no ingredient note`;
}

/** Labels of the dish's ticked tags that contradict its allergens, e.g. ["NCGI"]. */
export function conflictingTags(dish: Pick<Dish, "tags" | "allergens" | "notes">): string[] {
  return dish.tags.filter((tag) => tagConflict(tag, dish) !== null).map((tag) => DIETARY_TAGS[tag].label);
}
