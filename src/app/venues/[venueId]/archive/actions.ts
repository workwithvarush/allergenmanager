"use server";

import { refresh } from "next/cache";
import { archiveGroups, archiveRef, monthEnd, type ArchiveRecord } from "@/lib/archives";
import { venueNow } from "@/lib/changelog";
import { monthOf } from "@/lib/dates";
import { getAllEvents, getArchives, saveArchive } from "@/lib/demo-data";
import { canGenerateArchive } from "@/lib/permissions";
import { getSessionUser } from "@/lib/session";
import { venueDate } from "@/lib/venue-time";
import { VENUES } from "@/lib/venues";

/** `existing`: this month already had an archive (e.g. someone else generated it meanwhile), which stands. */
export type GenerateArchiveResult = { ok: true; ref: string; existing: boolean } | { ok: false; message: string };

/**
 * Issues this month's change log archive before month end: a fixed, partial
 * record from the 1st to today. As in the prototype, if this month already has
 * one, that one stands — an archive is never regenerated or edited.
 */
export async function generateArchiveEarly(venueId: string): Promise<GenerateArchiveResult> {
  const user = await getSessionUser();
  if (!canGenerateArchive(user.role)) {
    return { ok: false, message: "Only supervisors and F&B managers can generate an archive early." };
  }
  const venue = VENUES.find((v) => v.id === venueId && v.available);
  if (!venue) return { ok: false, message: "This venue isn't available." };

  const today = venueDate(new Date());
  const month = monthOf(today);
  const existing = (await getArchives(venue.id)).find((a) => a.month === month);
  if (existing) return { ok: true, ref: existing.ref, existing: true };

  const from = `${month}-01`;
  const archive: ArchiveRecord = {
    id: crypto.randomUUID(),
    venueId: venue.id,
    month,
    ref: archiveRef(venue.id, month),
    generatedAt: venueNow(),
    from,
    to: today,
    partial: today !== monthEnd(month),
    issuedBy: { name: user.name, role: user.role, email: user.email },
    groups: archiveGroups(await getAllEvents(venue.id), from, today),
  };
  await saveArchive(archive);
  refresh();
  return { ok: true, ref: archive.ref, existing: false };
}
