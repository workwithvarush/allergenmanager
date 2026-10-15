"use server";

import { refresh } from "next/cache";
import { allergenLabel, isAllergenId } from "@/lib/allergens";
import { makeLogEntry, type LogActor } from "@/lib/changelog";
import { getEvent, getMenus, saveEvent } from "@/lib/demo-data";
import { conflictingTags, DIETARY_TAGS, tagConflict, venueTags } from "@/lib/dietary-tags";
import {
  completeBlockedReason,
  MAX_DISH_NAME,
  MAX_MESSAGE,
  MAX_NOTE,
  printBlockedReason,
  type AllergenEvent,
  type AllergenMark,
  type Dish,
} from "@/lib/events";
import { activeMenus, instantiateMenu } from "@/lib/menus";
import { MAX_DISHES } from "@/lib/new-event";
import { getSessionUser } from "@/lib/session";
import { venueTime } from "@/lib/venue-time";
import { usesStandardMenus, VENUES } from "@/lib/venues";

/** What the entry screen needs back after a save: the new version stamp. */
export type SaveResult = { ok: true; version: number; lastModifiedAt: string } | { ok: false; message: string };

/** Dish ids are made in the browser so a new dish can be edited before its save returns. */
const DISH_ID = /^[a-z0-9-]{1,40}$/;

/** A change to save, with its change log line (e.g. "Red velvet cake — Milk added"). */
type Change = { event: AllergenEvent; log: string };

async function currentActor(): Promise<LogActor> {
  const user = await getSessionUser();
  return { name: user.name, role: user.role, email: user.email };
}

/** "Red velvet cake", or "Dish 3" for a dish without a name yet. */
function dishName(event: AllergenEvent, dish: Dish): string {
  return dish.name.trim() || `Dish ${event.dishes.indexOf(dish) + 1}`;
}

/**
 * Loads the event, applies one change and saves it with a new version, so
 * printed sheets show as out of date, plus a change log entry (amber once the
 * event has been printed). Each change is small (one dish, one field) so edits
 * from two people to different dishes don't overwrite each other.
 * `change` returns an error message instead when the change isn't allowed, or
 * null when there is nothing to change (e.g. a retried save that already landed).
 */
async function editEvent(
  venueId: string,
  eventId: string,
  change: (event: AllergenEvent) => Change | string | null,
): Promise<SaveResult> {
  // Placeholder: every role can enter allergens; check the real session here once sign-in exists.
  const actor = await currentActor();
  const venue = VENUES.find((v) => v.id === venueId && v.available);
  const event = venue && (await getEvent(venue.id, eventId));
  if (!event) return { ok: false, message: "This event no longer exists." };

  const changed = change(event);
  if (typeof changed === "string") return { ok: false, message: changed };
  if (changed === null) return { ok: true, version: event.version, lastModifiedAt: event.lastModifiedAt };

  const entry = makeLogEntry(actor, event.lastPrintedAt ? "warn" : "edit", changed.log);
  const saved = {
    ...changed.event,
    version: event.version + 1,
    lastModifiedAt: venueTime(new Date()),
    log: [...event.log, entry],
  };
  await saveEvent(saved);
  return { ok: true, version: saved.version, lastModifiedAt: saved.lastModifiedAt };
}

/** The event with one dish changed. */
function withDish(event: AllergenEvent, dishId: string, change: (dish: Dish) => Dish): AllergenEvent {
  return { ...event, dishes: event.dishes.map((d) => (d.id === dishId ? change(d) : d)) };
}

export async function renameDish(venueId: string, eventId: string, dishId: string, name: string): Promise<SaveResult> {
  const trimmed = name.trim();
  if (trimmed.length > MAX_DISH_NAME) {
    return { ok: false, message: `Dish name must be ${MAX_DISH_NAME} characters or fewer.` };
  }
  return editEvent(venueId, eventId, (event) => {
    const dish = event.dishes.find((d) => d.id === dishId);
    if (!dish) return "This dish has been removed.";
    if (dish.name === trimmed) return null;
    const before = dishName(event, dish);
    return {
      // A dish can't stay complete without a name — it would block printing unseen.
      event: withDish(event, dishId, (d) => ({ ...d, name: trimmed, complete: d.complete && trimmed !== "" })),
      log: trimmed ? `${before} renamed to “${trimmed}”` : `${before} — name cleared`,
    };
  });
}

export async function addDish(venueId: string, eventId: string, dishId: string): Promise<SaveResult> {
  if (!DISH_ID.test(dishId)) return { ok: false, message: "The dish could not be added." };
  return editEvent(venueId, eventId, (event) => {
    if (event.dishes.some((d) => d.id === dishId)) return null; // already added
    if (event.dishes.length >= MAX_DISHES) return `An event can hold at most ${MAX_DISHES} dishes.`;
    const dish: Dish = {
      id: dishId,
      name: "",
      section: event.menuId ? "Other" : "Dish",
      allergens: {},
      tags: [],
      mayContain: "",
      notes: {},
      complete: false,
    };
    return { event: { ...event, dishes: [...event.dishes, dish] }, log: "Dish added — awaiting name and allergens" };
  });
}

export async function removeDish(venueId: string, eventId: string, dishId: string): Promise<SaveResult> {
  return editEvent(venueId, eventId, (event) => {
    const dish = event.dishes.find((d) => d.id === dishId);
    if (!dish) return null; // already removed
    if (event.dishes.length <= 1) return "An event must keep at least one dish.";
    return {
      event: { ...event, dishes: event.dishes.filter((d) => d.id !== dishId) },
      log: `${dishName(event, dish)} — dish removed`,
    };
  });
}

/** Sets one allergen on one dish: "present" (contains), "may" (may contain) or null (none). */
export async function setAllergen(
  venueId: string,
  eventId: string,
  dishId: string,
  allergen: string,
  mark: AllergenMark | null,
): Promise<SaveResult> {
  if (!isAllergenId(allergen) || (mark !== null && mark !== "present" && mark !== "may")) {
    return { ok: false, message: "That allergen could not be saved." };
  }
  return editEvent(venueId, eventId, (event) => {
    const dish = event.dishes.find((d) => d.id === dishId);
    if (!dish) return "This dish has been removed.";
    const before = dish.allergens[allergen] ?? null;
    if (before === mark) return null;
    const allergens = { ...dish.allergens };
    if (mark) allergens[allergen] = mark;
    else delete allergens[allergen];
    // Wording from the prototype: "added", "moved to may contain", "removed".
    const what =
      mark === "present"
        ? "added"
        : mark === "may"
          ? before === "present"
            ? "moved to may contain"
            : "added as may contain"
          : "removed";
    return {
      event: withDish(event, dishId, (d) => ({ ...d, allergens })),
      log: `${dishName(event, dish)} — ${allergenLabel(allergen)} ${what}`,
    };
  });
}

/** Turns a dietary tag on or off. A tag that contradicts the dish's allergens can be removed but not added. */
export async function setTag(
  venueId: string,
  eventId: string,
  dishId: string,
  tag: string,
  on: boolean,
): Promise<SaveResult> {
  return editEvent(venueId, eventId, (event) => {
    const allowed = venueTags(event.venueId).find((t) => t === tag);
    if (!allowed) return "That tag isn't used at this venue.";
    const dish = event.dishes.find((d) => d.id === dishId);
    if (!dish) return "This dish has been removed.";
    if (dish.tags.includes(allowed) === on) return null;
    if (on) {
      const conflict = tagConflict(allowed, dish);
      if (conflict) return `${DIETARY_TAGS[allowed].label} can't be added — ${conflict}.`;
    }
    const tags = on ? [...dish.tags, allowed] : dish.tags.filter((t) => t !== allowed);
    return {
      event: withDish(event, dishId, (d) => ({ ...d, tags })),
      log: `${dishName(event, dish)} — ${DIETARY_TAGS[allowed].label} ${on ? "added" : "removed"}`,
    };
  });
}

/** Sets or clears (empty text) the ingredient note on one allergen of one dish. */
export async function setNote(
  venueId: string,
  eventId: string,
  dishId: string,
  allergen: string,
  text: string,
): Promise<SaveResult> {
  const note = text.replace(/\s+/g, " ").trim();
  if (!isAllergenId(allergen)) return { ok: false, message: "That note could not be saved." };
  if (note.length > MAX_NOTE) return { ok: false, message: `Notes must be ${MAX_NOTE} characters or fewer.` };
  return editEvent(venueId, eventId, (event) => {
    const dish = event.dishes.find((d) => d.id === dishId);
    if (!dish) return "This dish has been removed.";
    if ((dish.notes[allergen] ?? "") === note) return null;
    const notes = { ...dish.notes };
    if (note) notes[allergen] = note;
    else delete notes[allergen];
    const label = allergenLabel(allergen);
    return {
      event: withDish(event, dishId, (d) => ({ ...d, notes })),
      log: note ? `${dishName(event, dish)} — ${label} note set to “${note}”` : `${dishName(event, dish)} — ${label} note removed`,
    };
  });
}

/** Marks a dish complete or back in progress. Completing needs a name and no tag conflicts. */
export async function setComplete(
  venueId: string,
  eventId: string,
  dishId: string,
  complete: boolean,
): Promise<SaveResult> {
  return editEvent(venueId, eventId, (event) => {
    const dish = event.dishes.find((d) => d.id === dishId);
    if (!dish) return "This dish has been removed.";
    if (dish.complete === complete) return null;
    if (complete) {
      const blocked = completeBlockedReason(dish, conflictingTags(dish));
      if (blocked) return blocked;
    }
    return {
      event: withDish(event, dishId, (d) => ({ ...d, complete })),
      log: `${dishName(event, dish)} — marked ${complete ? "complete" : "in progress"}`,
    };
  });
}

export type ChangeMenuResult =
  | { ok: true; version: number; lastModifiedAt: string; menuId: string; menuName: string; dishes: Dish[] }
  | { ok: false; message: string };

/**
 * Switches a standard-menu event to another standard menu, replacing its dish
 * list with fresh, empty dishes — all allergen entry on the old dishes is lost.
 * Returns the new dishes so the page can show them.
 */
export async function changeMenu(venueId: string, eventId: string, menuId: string): Promise<ChangeMenuResult> {
  const venueForMenus = VENUES.find((v) => v.id === venueId && v.available);
  const menu = venueForMenus && activeMenus(await getMenus(venueForMenus.id)).find((m) => m.id === menuId);
  if (!menu) return { ok: false, message: "That menu isn't available." };
  const result = await editEvent(venueId, eventId, (event) => {
    if (!usesStandardMenus(event.venueId) || event.menuId === null) {
      return "This event uses a custom menu, so its menu can't be switched.";
    }
    if (event.menuId === menu.id) return null;
    return {
      event: { ...event, menuId: menu.id, menuName: menu.name, dishes: instantiateMenu(menu) },
      log: `Menu changed to ${menu.name} — dish list replaced`,
    };
  });
  if (!result.ok) return result;
  const venue = VENUES.find((v) => v.id === venueId);
  const saved = venue && (await getEvent(venue.id, eventId));
  if (!saved) return { ok: false, message: "This event no longer exists." };
  return { ...result, menuId: menu.id, menuName: menu.name, dishes: saved.dishes };
}

/** Sets the additional message printed below the allergen sheet; "" removes it. */
export async function setMessage(venueId: string, eventId: string, text: string): Promise<SaveResult> {
  // Keep the line breaks people type, but not runs of blank lines or trailing space.
  const message = text.replace(/\r\n?/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  if (message.length > MAX_MESSAGE) {
    return { ok: false, message: `The message must be ${MAX_MESSAGE} characters or fewer.` };
  }
  return editEvent(venueId, eventId, (event) =>
    event.customMessage === message
      ? null
      : {
          event: { ...event, customMessage: message },
          log: message ? "Additional message updated on the allergen sheet" : "Additional message cleared",
        },
  );
}

export type PrintResult = { ok: true; printedAt: string; version: number } | { ok: false; message: string };

/**
 * Records that all 3 documents were printed at `version`. Printing doesn't change
 * the documents, so the version stays the same; the event becomes "printed and
 * current" and any reprint flag is cleared. Refused if the event can't print yet,
 * or if it changed after these pages were laid out — they'd carry an old version.
 */
export async function recordPrint(venueId: string, eventId: string, version: number): Promise<PrintResult> {
  const actor = await currentActor();
  const venue = VENUES.find((v) => v.id === venueId && v.available);
  const event = venue && (await getEvent(venue.id, eventId));
  if (!event) return { ok: false, message: "This event no longer exists." };
  const blocked = printBlockedReason(event);
  if (blocked) return { ok: false, message: blocked };
  if (event.version !== version) {
    return {
      ok: false,
      message: `The event changed while printing (now v${event.version}). The printed pages show v${version}, so print again to give the counters the latest version.`,
    };
  }
  const printedAt = venueTime(new Date());
  await saveEvent({
    ...event,
    lastPrintedAt: printedAt,
    lastPrintedVersion: version,
    flagged: false,
    log: [...event.log, makeLogEntry(actor, "print", `Printed all 3 documents · v${version}`)],
  });
  refresh();
  return { ok: true, printedAt, version };
}
