import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { LoadingPlaceholder, Skeleton } from "@/components/Skeleton";
import { getEvent } from "@/lib/demo-data";
import { eventDateLabel, printBlockedReason } from "@/lib/events";
import { VENUES } from "@/lib/venues";
import { AllergenSheet, MenuDocument, Placecards } from "./Documents";
import { MessageEditor, PrintEventProvider, VersionStamp } from "./PrintEvent";
import { PrintButton, PrintedDialog, PrintError } from "./Printing";
import { PrintPreview } from "./PrintPreview";
import styles from "./PrintPage.module.css";

export async function generateMetadata({ params }: PageProps<"/venues/[venueId]/events/[eventId]/print">): Promise<Metadata> {
  const { venueId, eventId } = await params;
  const venue = VENUES.find((v) => v.id === venueId && v.available);
  await connection();
  const event = venue && (await getEvent(venue.id, eventId));
  return { title: `Preview & print · ${event?.name ?? "Event"} · Allergen Manager` };
}

/** The three printed documents for an event — allergen sheet, menu and placecards — as A4 previews. */
export default function PrintPage({ params }: PageProps<"/venues/[venueId]/events/[eventId]/print">) {
  return (
    <Suspense fallback={<PrintLoading />}>
      <PrintLoader params={params} />
    </Suspense>
  );
}

async function PrintLoader({ params }: { params: Promise<{ venueId: string; eventId: string }> }) {
  const { venueId, eventId } = await params;
  const venue = VENUES.find((v) => v.id === venueId && v.available);
  if (!venue) notFound();
  // Always print the latest version.
  await connection();
  const event = await getEvent(venue.id, eventId);
  if (!event) notFound();

  const entryHref = `/venues/${venue.id}/events/${event.id}`;
  const dashboardHref = `/venues/${venue.id}/dashboard`;
  const blocked = printBlockedReason(event);

  return (
    <PrintEventProvider
      venueId={venue.id}
      eventId={event.id}
      initialMessage={event.customMessage}
      initialVersion={event.version}
      initialLastModifiedAt={event.lastModifiedAt}
    >
      <div className={styles.screen}>
        <div className={styles.header} data-print-hide>
          <div>
            <Link href={dashboardHref} className={styles.back}>
              ‹ Back to dashboard
            </Link>
            <h1 className={styles.title}>Preview &amp; print</h1>
            <p className={styles.meta}>
              {event.name} · {eventDateLabel(event)} · {event.room} · {event.time}
            </p>
          </div>
          <div className={styles.headerActions}>
            <VersionStamp className={styles.version} />
            <Link href={entryHref} className="btn btn-secondary">
              Edit allergens
            </Link>
            <PrintButton blocked={blocked} />
          </div>
        </div>
        {blocked && (
          <p id="print-blocked" className="sr-only">
            {blocked}
          </p>
        )}
        <div data-print-hide>
          <PrintError />
        </div>

        {blocked && (
          <div className={`banner banner-warn ${styles.banner}`} data-print-hide>
            <div className="banner-body">
              <div className="banner-title">Not ready to print</div>
              <div>{blocked} These previews show the documents as they stand.</div>
            </div>
            <Link href={entryHref} className="btn btn-secondary btn-sm banner-action">
              Edit allergens
            </Link>
          </div>
        )}

        <p className={styles.previewLabel} data-print-hide>
          Preview · A4
        </p>
        <PrintPreview
          sheetTools={<MessageEditor />}
          documents={{
            sheet: <AllergenSheet event={event} />,
            menu: <MenuDocument event={event} />,
            placecards: <Placecards event={event} />,
          }}
        />
      </div>

      <div className={styles.footer} data-print-hide>
        <div className={styles.footerStart}>
          <Link href={dashboardHref} className="btn btn-ghost">
            ‹ Back to dashboard
          </Link>
          <Link href={entryHref} className="btn btn-secondary">
            Edit allergens
          </Link>
        </div>
        <PrintButton blocked={blocked} />
      </div>
      <PrintedDialog eventName={event.name} dashboardHref={dashboardHref} />
    </PrintEventProvider>
  );
}

function PrintLoading() {
  return (
    <div className={styles.screen}>
      <LoadingPlaceholder label="Loading documents">
        <Skeleton width={140} height={12} />
        <Skeleton width={240} height={26} style={{ marginTop: 10 }} />
        <Skeleton width={300} height={12} style={{ marginTop: 8, marginBottom: 24 }} />
        <Skeleton height={480} style={{ borderRadius: 8 }} />
      </LoadingPlaceholder>
    </div>
  );
}
