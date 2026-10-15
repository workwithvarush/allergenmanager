import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { LoadingPlaceholder, Skeleton } from "@/components/Skeleton";
import { getEvent, getMenus } from "@/lib/demo-data";
import { activeMenus } from "@/lib/menus";
import { VENUES } from "@/lib/venues";
import { EventEntry } from "./EventEntry";
import styles from "./EventEntry.module.css";

export async function generateMetadata({ params }: PageProps<"/venues/[venueId]/events/[eventId]">): Promise<Metadata> {
  const { venueId, eventId } = await params;
  const venue = VENUES.find((v) => v.id === venueId && v.available);
  await connection();
  const event = venue && (await getEvent(venue.id, eventId));
  return { title: `${event?.name ?? "Event"} · Allergen entry · Allergen Manager` };
}

/** Allergen entry for one event: its dishes, each filled in and marked complete before printing. */
export default function EventEntryPage({ params }: PageProps<"/venues/[venueId]/events/[eventId]">) {
  return (
    <Suspense fallback={<EntryLoading />}>
      <EntryLoader params={params} />
    </Suspense>
  );
}

async function EntryLoader({ params }: { params: Promise<{ venueId: string; eventId: string }> }) {
  const { venueId, eventId } = await params;
  const venue = VENUES.find((v) => v.id === venueId && v.available);
  if (!venue) notFound();
  // Events change as people edit them, so always read the latest.
  await connection();
  const event = await getEvent(venue.id, eventId);
  if (!event) notFound();
  const menus = activeMenus(await getMenus(venue.id));
  return <EventEntry key={event.id} initialEvent={event} menus={menus} />;
}

function EntryLoading() {
  return (
    <div className={styles.screen}>
      <LoadingPlaceholder label="Loading event">
        <Skeleton width={140} height={12} />
        <Skeleton width={320} height={26} style={{ marginTop: 10 }} />
        <Skeleton width={260} height={12} style={{ marginTop: 8, marginBottom: 24 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} height={120} style={{ borderRadius: 12 }} />
          ))}
        </div>
      </LoadingPlaceholder>
    </div>
  );
}
