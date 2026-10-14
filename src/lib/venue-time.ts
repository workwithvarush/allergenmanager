/** All venues are in Nottingham, so "today" and "now" are UK time wherever the server runs. */
export const VENUE_TIME_ZONE = "Europe/London";

/** ISO date ("2026-05-20") for `date` in UK time. */
export function venueDate(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: VENUE_TIME_ZONE }).format(date);
}

/** "HH:mm" for `date` in UK time. */
export function venueTime(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: VENUE_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
}

/** "Wednesday 20 May" for an ISO date. */
export function formatDayLong(isoDate: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(`${isoDate}T00:00:00Z`));
}
