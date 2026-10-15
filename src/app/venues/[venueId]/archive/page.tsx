import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense, type ReactNode } from "react";
import { LoadingPlaceholder, Skeleton } from "@/components/Skeleton";
import { archiveRef, dayMonth, earlyArchiveWording, monthEnd, type ArchiveRecord } from "@/lib/archives";
import { formatMonth, monthOf } from "@/lib/dates";
import { getArchives } from "@/lib/demo-data";
import { canGenerateArchive, canViewArchive } from "@/lib/permissions";
import { getSessionUser } from "@/lib/session";
import { venueDate } from "@/lib/venue-time";
import { VENUES } from "@/lib/venues";
import { GenerateEarly } from "./GenerateEarly";
import styles from "./Archive.module.css";

export async function generateMetadata({ params }: PageProps<"/venues/[venueId]/archive">): Promise<Metadata> {
  const { venueId } = await params;
  const venue = VENUES.find((v) => v.id === venueId);
  return { title: `Archive · ${venue?.name ?? "Venue"} · Allergen Manager` };
}

/** Monthly change log archives for the venue: issued records to download, and this month's to come. */
export default function ArchivePage({ params }: PageProps<"/venues/[venueId]/archive">) {
  return (
    <div className={styles.screen}>
      <Suspense fallback={<ArchiveLoading />}>
        <ArchiveList params={params} />
      </Suspense>
    </div>
  );
}


/** "15 Oct 2026 · 14:02" for "2026-10-15T14:02". */
const dateTime = (at: string) =>
  `${new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${at.slice(0, 10)}T00:00:00Z`),
  )} · ${at.slice(11, 16)}`;

async function ArchiveList({ params }: { params: Promise<{ venueId: string }> }) {
  const { venueId } = await params;
  const venue = VENUES.find((v) => v.id === venueId && v.available);
  if (!venue) notFound();
  await connection();
  const user = await getSessionUser();

  const header = (subtitle: string) => (
    <div className={styles.header}>
      <h1 className={styles.title}>Archive</h1>
      <p className={styles.sub}>{subtitle}</p>
    </div>
  );

  // As in the prototype, Allergen Members have no archive access.
  if (!canViewArchive(user.role)) {
    return header("Change log archives are available to chefs, supervisors and F&B managers.");
  }

  const today = venueDate(new Date());
  const month = monthOf(today);
  const archives = await getArchives(venue.id);
  const thisMonthIssued = archives.some((a) => a.month === month);

  return (
    <>
      {header(
        `Monthly change log records for ${venue.name}, issued as PDF at month end. Each archive is fixed at the time of generation.`,
      )}
      <ul className={styles.list}>
        {!thisMonthIssued && (
          <ArchiveRow
            month={formatMonth(month)}
            refCode={archiveRef(venue.id, month)}
            meta={`PDF issues automatically on ${dayMonth(monthEnd(month))} ${month.slice(0, 4)}`}
            badge={{ label: "Not yet issued", tone: "pending" }}
          >
            {canGenerateArchive(user.role) && (
              <GenerateEarly
                venueId={venue.id}
                {...earlyArchiveWording(today)}
              />
            )}
          </ArchiveRow>
        )}
        {archives.map((archive) => (
          <IssuedRow key={archive.id} archive={archive} venueId={venue.id} />
        ))}
      </ul>
      {archives.length === 0 && <p className={styles.note}>No archives issued yet.</p>}
    </>
  );
}

function IssuedRow({ archive, venueId }: { archive: ArchiveRecord; venueId: string }) {
  const month = formatMonth(archive.month);
  const coverage = archive.partial ? `covers ${Number(archive.from.slice(8))}–${dayMonth(archive.to)} · ` : "";
  return (
    <ArchiveRow
      month={month}
      refCode={archive.ref}
      meta={`PDF · ${coverage}generated ${dateTime(archive.generatedAt)} · ${archive.issuedBy.name} · ${archive.issuedBy.role}`}
      badge={archive.partial ? { label: "Partial", tone: "partial" } : { label: "Issued", tone: "issued" }}
    >
      <Link
        href={`/venues/${venueId}/archive/${archive.ref}`}
        prefetch={false}
        className="btn btn-gold btn-sm"
        aria-label={`Download PDF — ${month}${archive.partial ? " (partial)" : ""}`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
          <path d="M7 11l5 5 5-5" />
          <path d="M12 4v12" />
        </svg>
        Download PDF
      </Link>
    </ArchiveRow>
  );
}

function ArchiveRow({
  month,
  refCode,
  meta,
  badge,
  children,
}: {
  month: string;
  refCode: string;
  meta: string;
  badge: { label: string; tone: "pending" | "partial" | "issued" };
  children?: ReactNode;
}) {
  return (
    <li className={styles.row} data-archive-ref={badge.tone === "pending" ? undefined : refCode}>
      <div className={styles.rowStart}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={styles.fileIcon} aria-hidden="true">
          <path d="M14 3v4a1 1 0 0 0 1 1h4" />
          <path d="M5 8V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z" />
          <path d="M9 13h6M9 17h4" />
        </svg>
        <div className={styles.rowText}>
          <h2 className={styles.month}>{month}</h2>
          <p className={styles.meta}>
            <span className={styles.ref}>{refCode}</span> · {meta}
          </p>
        </div>
      </div>
      <div className={styles.rowEnd}>
        <span className={`${styles.badge} ${styles[badge.tone]}`}>{badge.label}</span>
        {children}
      </div>
    </li>
  );
}

function ArchiveLoading() {
  return (
    <LoadingPlaceholder label="Loading archive">
      <div className={styles.header}>
        <h1 className={styles.title}>Archive</h1>
        <Skeleton width={360} height={12} style={{ marginTop: 8 }} />
      </div>
      <Skeleton height={70} style={{ borderRadius: 8 }} />
    </LoadingPlaceholder>
  );
}
