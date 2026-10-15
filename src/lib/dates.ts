/**
 * Calendar arithmetic on ISO dates ("2026-05-20") and months ("2026-05").
 * Dates carry no time or zone, so everything is done in UTC to avoid DST shifts.
 */

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const ISO_MONTH = /^\d{4}-\d{2}$/;

function toUtc(isoDate: string): Date {
  return new Date(`${isoDate}T00:00:00Z`);
}

function fromUtc(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** True for a real calendar date, e.g. not "2026-02-31". */
export function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && ISO_DATE.test(value) && fromUtc(toUtc(value)) === value;
}

/** True for a real month between 2000 and 2099. */
export function isIsoMonth(value: unknown): value is string {
  if (typeof value !== "string" || !ISO_MONTH.test(value)) return false;
  const [year, month] = value.split("-").map(Number);
  return year >= 2000 && year <= 2099 && month >= 1 && month <= 12;
}

export function addDays(isoDate: string, days: number): string {
  const date = toUtc(isoDate);
  date.setUTCDate(date.getUTCDate() + days);
  return fromUtc(date);
}

/** "2026-05" for "2026-05-20". */
export function monthOf(isoDate: string): string {
  return isoDate.slice(0, 7);
}

export function addMonths(isoMonth: string, months: number): string {
  const [year, month] = isoMonth.split("-").map(Number);
  return fromUtc(new Date(Date.UTC(year, month - 1 + months, 1))).slice(0, 7);
}

/** Every date in the month, in order. */
export function daysOfMonth(isoMonth: string): string[] {
  const [year, month] = isoMonth.split("-").map(Number);
  const count = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return Array.from({ length: count }, (_, i) => `${isoMonth}-${String(i + 1).padStart(2, "0")}`);
}

/** 0 for Monday … 6 for Sunday — UK weeks start on Monday. */
export function weekdayIndex(isoDate: string): number {
  return (toUtc(isoDate).getUTCDay() + 6) % 7;
}

const format = (options: Intl.DateTimeFormatOptions) => {
  const formatter = new Intl.DateTimeFormat("en-GB", { ...options, timeZone: "UTC" });
  return (isoDate: string) => formatter.format(toUtc(isoDate));
};

/** "15 Oct" */
export const formatDayShort = format({ day: "numeric", month: "short" });

/** "October 2026" for "2026-10". */
export function formatMonth(isoMonth: string): string {
  return format({ month: "long", year: "numeric" })(`${isoMonth}-01`);
}
