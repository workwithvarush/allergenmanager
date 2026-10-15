import { notFound } from "next/navigation";
import { Suspense } from "react";
import { NottinghamVenuesLogo } from "@/components/NottinghamVenuesLogo";
import { OfflineBanner } from "@/components/OfflineBanner";
import { Skeleton } from "@/components/Skeleton";
import { getAllEvents, getEventsForDay } from "@/lib/demo-data";
import { printBlockedReason } from "@/lib/events";
import { postPrintAlerts } from "@/lib/notifications";
import { venueDate } from "@/lib/venue-time";
import { getSessionUser } from "@/lib/session";
import { VENUES, type VenueId } from "@/lib/venues";
import { VenueHeader } from "./VenueHeader";
import styles from "./VenueShell.module.css";

/** Venues are a fixed list, so every venue route is known at build time. */
export function generateStaticParams() {
  return VENUES.filter((venue) => venue.available).map((venue) => ({ venueId: venue.id }));
}

/**
 * App frame shared by a venue's pages. The frame is static; the header reads
 * the venue and signed-in user, so it sits behind Suspense to keep navigation instant.
 */
export default function VenueLayout({ children, params }: LayoutProps<"/venues/[venueId]">) {
  return (
    <div className={styles.shell}>
      <div className={styles.frame}>
        <div data-print-hide>
          <Suspense fallback={<HeaderPlaceholder />}>
            <VenueHeaderLoader params={params} />
          </Suspense>
        </div>
        <div className={styles.offline} data-print-hide>
          <OfflineBanner />
        </div>
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}

async function VenueHeaderLoader({ params }: { params: Promise<{ venueId: string }> }) {
  const { venueId } = await params;
  const venue = VENUES.find((v) => v.id === venueId);
  if (!venue || !venue.available) notFound();
  const user = await getSessionUser();
  const [alerts, tourEventId] = await Promise.all([postPrintAlerts(venue.id, user), tourEvent(venue.id)]);
  return (
    <VenueHeader venueId={venue.id} venueName={venue.name} user={user} alerts={alerts} tourEventId={tourEventId} />
  );
}

/**
 * The event the tour shows on the entry and print screens, as in the prototype:
 * one of today's that is ready to print, else the first today, else any.
 */
async function tourEvent(venueId: VenueId): Promise<string | null> {
  const today = await getEventsForDay(venueId, venueDate(new Date()));
  const ready = today.find((e) => e.dishes.length > 0 && printBlockedReason(e) === null);
  return (ready ?? today[0] ?? (await getAllEvents(venueId))[0])?.id ?? null;
}

function HeaderPlaceholder() {
  return (
    <div className="topnav" aria-hidden="true">
      <NottinghamVenuesLogo height={30} />
      <Skeleton width={260} height={28} />
    </div>
  );
}
