import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { LoadingPlaceholder, Skeleton } from "@/components/Skeleton";
import { getEventsForDay } from "@/lib/demo-data";
import { sortByServiceTime } from "@/lib/events";
import { canSeeAllVenues } from "@/lib/permissions";
import { getSessionUser } from "@/lib/session";
import { formatDayLong, venueDate } from "@/lib/venue-time";
import { VENUES } from "@/lib/venues";
import { DashboardVenueSwitcher } from "./DashboardVenueSwitcher";
import { Dashboard } from "./Dashboard";
import styles from "./Dashboard.module.css";

export async function generateMetadata({ params }: PageProps<"/venues/[venueId]/dashboard">): Promise<Metadata> {
  const { venueId } = await params;
  const venue = VENUES.find((v) => v.id === venueId);
  return { title: `Dashboard · ${venue?.name ?? "Venue"} · Allergen Manager` };
}

export default function DashboardPage({ params }: PageProps<"/venues/[venueId]/dashboard">) {
  // Params are read inside the Suspense boundary so the shell can render instantly on navigation.
  return (
    <div className={styles.screen}>
      <Suspense fallback={<DashboardLoading />}>
        <TodaysEvents params={params} />
      </Suspense>
    </div>
  );
}

/** Everything that depends on the request: the venue, today's date, the user's role and the events. */
async function TodaysEvents({ params }: { params: Promise<{ venueId: string }> }) {
  const { venueId: id } = await params;
  const venue = VENUES.find((v) => v.id === id);
  if (!venue || !venue.available) notFound();
  const venueId = venue.id;
  // "Today" depends on when the page is requested, so it is never prerendered.
  await connection();
  const today = venueDate(new Date());
  const [user, events] = await Promise.all([getSessionUser(), getEventsForDay(venueId, today)]);

  // F&B Managers also see today's totals across every venue.
  const otherVenueEvents = canSeeAllVenues(user.role)
    ? (
        await Promise.all(
          VENUES.filter((v) => v.available && v.id !== venueId).map((v) => getEventsForDay(v.id, today)),
        )
      ).flat()
    : undefined;

  return (
    <>
      <DashboardVenueSwitcher role={user.role} venueId={venueId} />
      <Dashboard
        venueId={venueId}
        role={user.role}
        dayLabel={formatDayLong(today)}
        initialEvents={sortByServiceTime(events)}
        otherVenueEvents={otherVenueEvents}
      />
    </>
  );
}

function DashboardLoading() {
  return (
    <LoadingPlaceholder label="Loading today's events">
      <div className={styles.header}>
        <h1 className={styles.title}>Today&apos;s events</h1>
        <Skeleton width={180} height={12} style={{ marginTop: 8 }} />
      </div>
      <div className={styles.statRows}>
        <div className={styles.stats4}>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} height={66} style={{ borderRadius: 8 }} />
          ))}
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        {[64, 108, 90, 80].map((width) => (
          <Skeleton key={width} width={width} height={28} style={{ borderRadius: 999 }} />
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} height={74} style={{ borderRadius: 10 }} />
        ))}
      </div>
    </LoadingPlaceholder>
  );
}
