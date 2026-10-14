import { notFound } from "next/navigation";
import { Suspense } from "react";
import { NottinghamVenuesLogo } from "@/components/NottinghamVenuesLogo";
import { OfflineBanner } from "@/components/OfflineBanner";
import { Skeleton } from "@/components/Skeleton";
import { getSessionUser } from "@/lib/session";
import { VENUES } from "@/lib/venues";
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
        <Suspense fallback={<HeaderPlaceholder />}>
          <VenueHeaderLoader params={params} />
        </Suspense>
        <div className={styles.offline}>
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
  return <VenueHeader venueId={venue.id} venueName={venue.name} user={user} />;
}

function HeaderPlaceholder() {
  return (
    <div className="topnav" aria-hidden="true">
      <NottinghamVenuesLogo height={30} />
      <Skeleton width={260} height={28} />
    </div>
  );
}
