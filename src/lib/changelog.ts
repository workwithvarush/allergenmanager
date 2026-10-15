import type { Role } from "@/lib/roles";
import { venueDate, venueTime } from "@/lib/venue-time";

/**
 * edit: a change before printing · warn: a change after printing (the printed
 * sheets are now out of date) · print: documents printed · neutral: automatic.
 * Shown as forest, amber, gold and grey dots, as in the prototype.
 */
export type LogType = "edit" | "warn" | "print" | "neutral";

/** Who made a change; "Automatic" for entries the system writes itself. */
export type LogActor = { name: string; role: Role | "Automatic"; email: string };

export type LogEntry = LogActor & {
  id: string;
  /** UK local time, "2026-10-15T09:14" — every venue is in Nottingham. */
  at: string;
  type: LogType;
  /** e.g. "Red velvet cake — Milk added". */
  text: string;
};

/** "2026-10-15T09:14" for now in UK time. */
export function venueNow(now = new Date()): string {
  return `${venueDate(now)}T${venueTime(now)}`;
}

export function makeLogEntry(actor: LogActor, type: LogType, text: string, at = venueNow()): LogEntry {
  return { id: crypto.randomUUID(), at, type, text, ...actor };
}
