/** Staff roles on a shared venue login, from least to most access. */
export const ROLES = ["Allergen Member", "Chef", "Supervisor", "F&B Manager"] as const;

export type Role = (typeof ROLES)[number];
