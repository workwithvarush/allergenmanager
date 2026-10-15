import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { LoadingPlaceholder, Skeleton } from "@/components/Skeleton";
import type { LogEntry } from "@/lib/changelog";
import { addDays, formatDayShort } from "@/lib/dates";
import { getAllEvents } from "@/lib/demo-data";
import { canSwitchVenue } from "@/lib/permissions";
import { getSessionUser } from "@/lib/session";
import { venueDate } from "@/lib/venue-time";
import { VENUES, type VenueId } from "@/lib/venues";
import { ChangelogControls } from "./ChangelogControls";
import styles from "./Changelog.module.css";
import { matchesSearch, MAX_SEARCH, PERIODS, type Period } from "./periods";

export async function generateMetadata({ params }: PageProps<"/venues/[venueId]/changelog">): Promise<Metadata> {
  const { venueId } = await params;
  const venue = VENUES.find((v) => v.id === venueId);
  return { title: `Change log · ${venue?.name ?? "Venue"} · Allergen Manager` };
}

/**
 * Every change across a venue's events, newest first — who changed what, when.
 * The period (`?period=week`) and, for roles that move between venues, the
 * venue (`?venue=all`) are in the URL.
 */
export default function ChangelogPage({ params, searchParams }: PageProps<"/venues/[venueId]/changelog">) {
  return (
    <div className={styles.screen}>
      <Suspense fallback={<ChangelogLoading />}>
        <Changelog params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

/** How many days back each period reaches, as in the prototype (today, 7 days, 30 days). */
const PERIOD_DAYS: Record<Period, number | null> = { today: 0, week: 6, month: 30, all: null };

type Row = LogEntry & { eventId: string; eventName: string; venueId: VenueId };

async function Changelog({
  params,
  searchParams,
}: {
  params: Promise<{ venueId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ venueId: id }, query] = await Promise.all([params, searchParams]);
  const venue = VENUES.find((v) => v.id === id && v.available);
  if (!venue) notFound();
  // The log grows as people edit, so always read the latest.
  await connection();
  const user = await getSessionUser();
  const today = venueDate(new Date());

  const period: Period = PERIODS.some((p) => p.id === query.period) ? (query.period as Period) : "today";
  const search = typeof query.q === "string" ? query.q.trim().slice(0, MAX_SEARCH) : "";
  const multiVenue = canSwitchVenue(user.role);
  const available = VENUES.filter((v) => v.available);
  // Other venues are only open to roles that can switch venue.
  const venueChoice =
    multiVenue && (query.venue === "all" || available.some((v) => v.id === query.venue))
      ? (query.venue as VenueId | "all")
      : venue.id;
  const venueIds = venueChoice === "all" ? available.map((v) => v.id) : [venueChoice];

  const reach = PERIOD_DAYS[period];
  const from = reach === null ? null : addDays(today, -reach);
  const rows: Row[] = (
    await Promise.all(
      venueIds.map(async (venueId) =>
        (await getAllEvents(venueId)).flatMap((event) =>
          event.log.map((entry) => ({ ...entry, eventId: event.id, eventName: event.name, venueId })),
        ),
      ),
    )
  )
    .flat()
    .filter((row) => from === null || row.at.slice(0, 10) >= from)
    .filter((row) => !search || matchesSearch(search, [row.text, row.name, row.role, row.eventName]))
    // Newest first; entries in the same minute keep the order they were made in (latest first).
    .map((row, i) => ({ row, i }))
    .sort((a, b) => b.row.at.localeCompare(a.row.at) || b.i - a.i)
    .map(({ row }) => row);

  const venueLabel = venueChoice === "all" ? "all venues" : VENUES.find((v) => v.id === venueChoice)!.name;
  const periodLabel = PERIODS.find((p) => p.id === period)!.label.toLowerCase();
  const when = period === "all" ? "in total" : periodLabel;
  const count = `${rows.length} ${rows.length === 1 ? "entry" : "entries"}`;

  return (
    <>
      <div className={styles.header}>
        <h1 className={styles.title}>Change log</h1>
        <p className={styles.sub}>
          All edits across {venueLabel === "all venues" ? "all venues'" : `${venueLabel}'s`} events, newest first ·{" "}
          {/* Announced as the results change, e.g. while searching. */}
          <span role="status">
            {search
              ? `${count} ${rows.length === 1 ? "matches" : "match"} “${search}”${period === "all" ? "" : ` ${periodLabel}`}`
              : `${count} ${when}`}
          </span>
        </p>
      </div>

      <ChangelogControls
        search={search}
        period={period}
        venue={multiVenue ? venueChoice : null}
        venues={available.map((v) => ({ id: v.id, name: v.name }))}
      />

      {rows.length === 0 ? (
        <p className={styles.empty}>
          {search
            ? period === "all"
              ? `No entries match “${search}”.`
              : `No entries match “${search}” ${periodLabel}. Try a longer period.`
            : period === "all"
              ? "No changes recorded yet."
              : `No changes recorded ${periodLabel}.`}
        </p>
      ) : (
        <ol className={styles.list} aria-label="Changes, newest first">
          {rows.map((row) => (
            <li key={`${row.eventId}-${row.id}`}>
              <Link href={`/venues/${row.venueId}/events/${row.eventId}`} prefetch={false} className={styles.row}>
                <span className={`${styles.dot} ${styles[row.type]}`} aria-hidden="true" />
                <span className={styles.body}>
                  <span className={styles.line}>
                    <strong className={styles.person}>{row.name}</strong>
                    <span className={`${styles.role} ${styles[roleClass(row.role)]}`}>{row.role}</span>
                    <span>— {row.text}</span>
                    {row.type === "warn" && <span className="sr-only">(after printing)</span>}
                  </span>
                  <span className={styles.context}>
                    <strong>{row.eventName}</strong>
                    {venueChoice === "all" && ` · ${VENUES.find((v) => v.id === row.venueId)!.name}`}{" "}
                    <span className={styles.email}>{row.email}</span>
                  </span>
                </span>
                <time className={styles.time} dateTime={row.at}>
                  {row.at.slice(0, 10) === today ? row.at.slice(11, 16) : `${formatDayShort(row.at.slice(0, 10))} · ${row.at.slice(11, 16)}`}
                </time>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}

/** CSS class for a role badge, from the prototype's palette. */
function roleClass(role: string): string {
  return { "F&B Manager": "roleManager", Supervisor: "roleSupervisor", Chef: "roleChef", "Allergen Member": "roleMember" }[
    role
  ] ?? "roleAutomatic";
}

function ChangelogLoading() {
  return (
    <LoadingPlaceholder label="Loading change log">
      <div className={styles.header}>
        <h1 className={styles.title}>Change log</h1>
        <Skeleton width={280} height={12} style={{ marginTop: 8 }} />
      </div>
      <Skeleton height={52} style={{ borderRadius: 8, marginBottom: 14 }} />
      <Skeleton height={360} style={{ borderRadius: 8 }} />
    </LoadingPlaceholder>
  );
}
