"use server";

import { refresh } from "next/cache";
import { getMenus, saveMenus } from "@/lib/demo-data";
import { activeMenus, hasMenuErrors, validateMenu, type MenuErrors, type StandardMenu } from "@/lib/menus";
import { canManageMenus } from "@/lib/permissions";
import { getSessionUser } from "@/lib/session";
import { usesStandardMenus, VENUES } from "@/lib/venues";

export type MenuDraft = { id: string | null; name: string; dishes: { section: string; name: string }[] };

export type SaveMenuResult = { ok: true; id: string } | { ok: false; errors: MenuErrors; message?: string };

async function menuVenue(venueId: string): Promise<{ error: string } | { venue: (typeof VENUES)[number] }> {
  const user = await getSessionUser();
  if (!canManageMenus(user.role)) return { error: "Only supervisors and F&B managers can change menus." };
  const venue = VENUES.find((v) => v.id === venueId && v.available);
  if (!venue || !usesStandardMenus(venue.id)) return { error: "This venue has no standard menus." };
  return { venue };
}

/**
 * Creates (id null) or updates a standard menu. Changes apply to events created
 * afterwards; events already using the menu keep their own copy of its dishes.
 */
export async function saveMenu(venueId: string, draft: MenuDraft): Promise<SaveMenuResult> {
  const found = await menuVenue(venueId);
  if ("error" in found) return { ok: false, errors: {}, message: found.error };
  const menus = await getMenus(found.venue.id);
  const existing = draft.id === null ? undefined : menus.find((m) => m.id === draft.id);
  if (draft.id !== null && !existing) return { ok: false, errors: {}, message: "This menu no longer exists." };

  const dishes = draft.dishes.map((d) => ({ section: d.section, name: d.name.trim() }));
  const errors = validateMenu(
    { name: draft.name, dishes },
    menus.filter((m) => m.id !== draft.id),
  );
  if (hasMenuErrors(errors)) return { ok: false, errors };

  // A dish keeps its recorded allergens only while it is the same dish (same name and section).
  const recorded = (dish: { section: string; name: string }) =>
    existing?.dishes.find((d) => d.name === dish.name && d.section === dish.section);
  const menu: StandardMenu = {
    id: existing?.id ?? `m-${crypto.randomUUID().slice(0, 8)}`,
    name: draft.name.trim(),
    dishes: dishes.map((dish) => {
      const before = recorded(dish);
      return before ? { ...before } : dish;
    }),
    retired: existing?.retired ?? false,
  };
  await saveMenus(found.venue.id, existing ? menus.map((m) => (m.id === menu.id ? menu : m)) : [...menus, menu]);
  refresh();
  return { ok: true, id: menu.id };
}

export type RetireResult = { ok: true } | { ok: false; message: string };

/** Retires a menu (no longer offered for new events) or brings it back. */
export async function setMenuRetired(venueId: string, menuId: string, retired: boolean): Promise<RetireResult> {
  const found = await menuVenue(venueId);
  if ("error" in found) return { ok: false, message: found.error };
  const menus = await getMenus(found.venue.id);
  const menu = menus.find((m) => m.id === menuId);
  if (!menu) return { ok: false, message: "This menu no longer exists." };
  if (retired && !menu.retired && activeMenus(menus).length <= 1) {
    return { ok: false, message: "At least one menu must stay available for new events." };
  }
  await saveMenus(
    found.venue.id,
    menus.map((m) => (m.id === menuId ? { ...m, retired } : m)),
  );
  refresh();
  return { ok: true };
}
