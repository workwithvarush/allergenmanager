import type { Role } from "@/lib/roles";

/**
 * What each role may do, as in the prototype. These only decide what the UI
 * shows — once there is a backend, the server must enforce the same rules.
 */

/** Everyone except Allergen Members can flag a printed event for reprint. */
export function canFlagForReprint(role: Role): boolean {
  return role !== "Allergen Member";
}

/** Everyone except Allergen Members sees the "Pending review" count. */
export function canSeePendingReview(role: Role): boolean {
  return role !== "Allergen Member";
}

/** F&B Managers see totals across every venue. */
export function canSeeAllVenues(role: Role): boolean {
  return role === "F&B Manager";
}

/** Supervisors and F&B Managers can move between venues without logging in again. */
export function canSwitchVenue(role: Role): boolean {
  return role === "Supervisor" || role === "F&B Manager";
}

/** Everyone except Allergen Members can create events. */
export function canCreateEvents(role: Role): boolean {
  return role !== "Allergen Member";
}

/** Supervisors and F&B Managers can give an EMCC event a custom menu instead of a standard one. */
export function canCreateCustomMenu(role: Role): boolean {
  return role === "Supervisor" || role === "F&B Manager";
}
