import { isIsoDate } from "@/lib/dates";
import { ROOMS } from "@/lib/venues";

/** What the New event form sends. Numbers stay as typed so half-filled fields can be shown back. */
export type NewEventInput = {
  name: string;
  /** ISO date. */
  date: string;
  room: string;
  /** "HH:mm", 24h. */
  time: string;
  guests: string;
  /** A standard menu letter, or "custom". */
  menu: string;
  customName: string;
  numDishes: string;
};

export type NewEventField = keyof NewEventInput;
export type NewEventErrors = Partial<Record<NewEventField, string>>;

export const MAX_GUESTS = 5000;
export const MAX_DISHES = 60;

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Error for a count field ("Guest count", "Number of dishes"), or undefined if it's a whole number in range. */
function countError(value: string, label: string, max: number): string | undefined {
  const text = value.trim();
  if (text !== "" && !/^-?\d+$/.test(text)) return `${label} must be a whole number`;
  if (text === "" || Number(text) < 1) return `${label} must be at least 1`;
  if (Number(text) > max) return `${label} must be ${max} or fewer`;
  return undefined;
}

/** The same day `years` later or earlier, as an ISO string — only compared against, never shown. */
function shiftYears(isoDate: string, years: number): string {
  return `${Number(isoDate.slice(0, 4)) + years}${isoDate.slice(4)}`;
}

/** How far from today an event can be dated — catches typos such as 0202 or 2062 for the year. */
export const MAX_YEARS_AWAY = 2;

/**
 * Checks the form, as in the prototype. Runs in the browser for quick feedback
 * and again on the server, which also checks permissions and duplicate names.
 * Messages follow the design system: factual and neutral, e.g. "Event name is required".
 * `standardMenus`: false at venues (Bramleys) that build every menu dish by dish.
 * `today`: today's ISO date in UK time.
 */
export function validateNewEvent(
  input: NewEventInput,
  {
    standardMenus,
    today,
    menuIds,
  }: {
    standardMenus: boolean;
    today: string;
    /** The menus that can be chosen (the venue's, not retired). */
    menuIds: readonly string[];
  },
): NewEventErrors {
  const errors: NewEventErrors = {};
  if (!input.name.trim()) errors.name = "Event name is required";
  else if (input.name.trim().length > 120) errors.name = "Event name must be 120 characters or fewer";
  if (!input.date) errors.date = "Date is required";
  else if (!isIsoDate(input.date)) errors.date = "Date is not a valid calendar date";
  else if (input.date < shiftYears(today, -MAX_YEARS_AWAY) || input.date > shiftYears(today, MAX_YEARS_AWAY)) {
    errors.date = `Date must be within ${MAX_YEARS_AWAY} years of today`;
  }
  if (!(ROOMS as readonly string[]).includes(input.room)) errors.room = "Room is required";
  if (!input.time) errors.time = "Service time is required";
  else if (!TIME.test(input.time)) errors.time = "Service time must be a 24h time, e.g. 12:30";
  const guests = countError(input.guests, "Guest count", MAX_GUESTS);
  if (guests) errors.guests = guests;
  const custom = !standardMenus || input.menu === "custom";
  if (!custom && !menuIds.includes(input.menu)) errors.menu = "Starting menu is required";
  if (custom) {
    if (input.customName.trim().length > 80) errors.customName = "Menu name must be 80 characters or fewer";
    const numDishes = countError(input.numDishes, "Number of dishes", MAX_DISHES);
    if (numDishes) errors.numDishes = numDishes;
  }
  return errors;
}
