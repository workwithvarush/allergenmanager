"use server";

import { markAlertsSeen } from "@/lib/demo-data";
import { postPrintAlerts, type PostPrintAlerts } from "@/lib/notifications";
import { getSessionUser } from "@/lib/session";
import { VENUES } from "@/lib/venues";

function findVenue(venueId: string) {
  return VENUES.find((v) => v.id === venueId && v.available);
}

/** The bell's current list, for refreshing it without reloading the page. */
export async function loadAlerts(venueId: string): Promise<PostPrintAlerts> {
  const venue = findVenue(venueId);
  if (!venue) return { items: [], unread: 0 };
  return postPrintAlerts(venue.id, await getSessionUser());
}

/** Marks the listed alerts as seen by the signed-in person (opening the bell does this, as in the prototype). */
export async function markAlertsRead(venueId: string, ids: string[]): Promise<void> {
  const venue = findVenue(venueId);
  if (!venue) return;
  const user = await getSessionUser();
  await markAlertsSeen(user.email, venue.id, ids.slice(0, 100));
}
