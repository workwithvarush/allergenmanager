"use server";

import { refresh } from "next/cache";
import { makeLogEntry } from "@/lib/changelog";
import { getEventsForDay, getMenus, saveEvent } from "@/lib/demo-data";
import type { AllergenEvent, Dish } from "@/lib/events";
import { activeMenus, instantiateMenu } from "@/lib/menus";
import { validateNewEvent, type NewEventErrors, type NewEventInput } from "@/lib/new-event";
import { canCreateCustomMenu, canCreateEvents } from "@/lib/permissions";
import { getSessionUser } from "@/lib/session";
import { venueDate, venueTime } from "@/lib/venue-time";
import { usesStandardMenus, VENUES } from "@/lib/venues";

export type CreateEventResult =
  | { ok: true; event: { id: string; name: string; date: string } }
  | { ok: false; errors: NewEventErrors; message?: string };

/**
 * Creates an event from the New event form. Everything is checked again here —
 * the form's own checks can be bypassed — then the current page is refreshed.
 */
export async function createEvent(venueId: string, input: NewEventInput): Promise<CreateEventResult> {
  const user = await getSessionUser();
  if (!canCreateEvents(user.role)) {
    return {
      ok: false,
      errors: {},
      message: "Event not created — only chefs, supervisors and F&B managers can create events.",
    };
  }

  const venue = VENUES.find((v) => v.id === venueId);
  if (!venue || !venue.available) {
    return { ok: false, errors: {}, message: "Event not created — this venue is not open for events yet." };
  }

  const standardMenus = usesStandardMenus(venue.id);
  const menus = activeMenus(await getMenus(venue.id));
  const errors = validateNewEvent(input, {
    standardMenus,
    today: venueDate(new Date()),
    menuIds: menus.map((m) => m.id),
  });
  const custom = !standardMenus || input.menu === "custom";
  if (custom && standardMenus && !canCreateCustomMenu(user.role)) {
    errors.menu = "Only supervisors and F&B managers can create custom menus";
  }

  const name = input.name.trim();
  if (!errors.name && !errors.date) {
    const sameDay = await getEventsForDay(venue.id, input.date);
    if (sameDay.some((event) => event.name.toLowerCase() === name.toLowerCase())) {
      errors.name = "An event with this name already exists on this date";
    }
  }
  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const menu = custom ? undefined : menus.find((m) => m.id === input.menu);
  const dishes: Dish[] = menu
    ? instantiateMenu(menu)
    : Array.from({ length: Number(input.numDishes) }, (_, i) => ({
        id: `d${i + 1}`,
        section: "Dish",
        name: "",
        allergens: {},
        tags: [],
        mayContain: "",
        notes: {},
        complete: false,
      }));

  const event: AllergenEvent = {
    id: `${venue.id}-${crypto.randomUUID().slice(0, 8)}`,
    venueId: venue.id,
    name,
    room: input.room,
    date: input.date,
    endDate: null,
    time: input.time,
    guests: Number(input.guests),
    menuId: menu ? menu.id : null,
    // The menu's name now; renaming the menu later doesn't relabel this event.
    menuName: menu ? menu.name : input.customName.trim() || "Custom menu",
    dishes,
    version: 1,
    lastPrintedAt: null,
    lastPrintedVersion: null,
    lastModifiedAt: venueTime(new Date()),
    flagged: false,
    customMessage: "",
    log: [
      makeLogEntry(
        { name: user.name, role: user.role, email: user.email },
        "edit",
        menu
          ? `Event created — ${menu.name} assigned`
          : `Event created — ${input.customName.trim() || "Custom menu"} · ${dishes.length} ${dishes.length === 1 ? "dish" : "dishes"} to configure`,
      ),
    ],
  };
  await saveEvent(event);

  refresh();
  return { ok: true, event: { id: event.id, name: event.name, date: event.date } };
}
