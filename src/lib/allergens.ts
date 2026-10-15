/**
 * The 14 statutory UK allergens, in the order the prototype uses for entry
 * grids, the allergen sheet and the matrix.
 */
export const ALLERGENS = [
  { id: "gluten", label: "Gluten" },
  { id: "eggs", label: "Eggs" },
  { id: "fish", label: "Fish" },
  { id: "crustaceans", label: "Crustaceans" },
  { id: "peanuts", label: "Peanuts" },
  { id: "soya", label: "Soya" },
  { id: "celery", label: "Celery" },
  { id: "milk", label: "Milk" },
  { id: "tree-nuts", label: "Tree Nuts" },
  { id: "mustard", label: "Mustard" },
  { id: "sesame", label: "Sesame" },
  { id: "sulphites", label: "Sulphites" },
  { id: "lupin", label: "Lupin" },
  { id: "molluscs", label: "Molluscs" },
] as const;

export type AllergenId = (typeof ALLERGENS)[number]["id"];

export function allergenLabel(id: AllergenId): string {
  return ALLERGENS.find((a) => a.id === id)!.label;
}

/** True for one of the 14 allergen ids, e.g. checking a value sent from the browser. */
export function isAllergenId(value: string): value is AllergenId {
  return ALLERGENS.some((allergen) => allergen.id === value);
}
