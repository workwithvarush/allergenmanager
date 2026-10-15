import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { LoadingPlaceholder, Skeleton } from "@/components/Skeleton";
import { roleClass, type LogEntry } from "@/lib/changelog";
import { earlyArchiveWording } from "@/lib/archives";
import { formatDayShort, monthOf } from "@/lib/dates";
import { getAllEvents, getArchives } from "@/lib/demo-data";
import { canGenerateArchive, canSwitchVenue } from "@/lib/permissions";
import { ROLES } from "@/lib/roles";
import { getSessionUser } from "@/lib/session";
import { venueDate } from "@/lib/venue-time";
import { VENUES, type VenueId } from "@/lib/venues";
import { GenerateEarly } from "../archive/GenerateEarly";
import { ChangelogControls } from "./ChangelogControls";
import styles from "./Changelog.module.css";
import {
  DEFAULT_PERIOD,
  FILTER_KEYS,
  FILTER_LABELS,
  matchesSearch,
  MAX_SEARCH,
  periodStart,
  PERIODS,
  type FilterOption,
  type FilterOptions,
  type Filters,
  type Period,
} from "./periods";

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

  const period: Period = PERIODS.some((p) => p.id === query.period) ? (query.period as Period) : DEFAULT_PERIOD;
  const search = typeof query.q === "string" ? query.q.trim().slice(0, MAX_SEARCH) : "";
  const multiVenue = canSwitchVenue(user.role);
  const available = VENUES.filter((v) => v.available);
  // Other venues are only open to roles that can switch venue.
  const venueChoice =
    multiVenue && (query.venue === "all" || available.some((v) => v.id === query.venue))
      ? (query.venue as VenueId | "all")
      : venue.id;
  const venueIds = venueChoice === "all" ? available.map((v) => v.id) : [venueChoice];

  // Every entry at the chosen venue(s), before the period, search and filters narrow it.
  const scope: Row[] = (
    await Promise.all(
      venueIds.map(async (venueId) =>
        (await getAllEvents(venueId)).flatMap((event) =>
          event.log.map((entry) => ({ ...entry, eventId: event.id, eventName: event.name, venueId })),
        ),
      ),
    )
  ).flat();

  // Filter choices come from the whole scope, so they don't vanish when the period or search narrows the list.
  const options = filterOptions(scope, venueChoice === "all");
  const filters: Filters = {
    person: options.person.some((o) => o.value === query.person) ? (query.person as string) : "",
    role: options.role.some((o) => o.value === query.role) ? (query.role as string) : "",
    event: options.event.some((o) => o.value === query.event) ? (query.event as string) : "",
  };
  const activeFilters = FILTER_KEYS.filter((key) => filters[key]);

  const from = periodStart(period, today);
  const thisMonthArchive = (await getArchives(venue.id)).find((a) => a.month === monthOf(today));
  const rows = scope
    .filter((row) => from === null || row.at.slice(0, 10) >= from)
    .filter((row) => !search || matchesSearch(search, [row.text, row.name, row.role, row.eventName]))
    .filter(
      (row) =>
        (!filters.person || row.name === filters.person) &&
        (!filters.role || row.role === filters.role) &&
        (!filters.event || row.eventId === filters.event),
    )
    // Newest first; entries in the same minute keep the order they were made in (latest first).
    .map((row, i) => ({ row, i }))
    .sort((a, b) => b.row.at.localeCompare(a.row.at) || b.i - a.i)
    .map(({ row }) => row);

  const venueLabel = venueChoice === "all" ? "all venues" : VENUES.find((v) => v.id === venueChoice)!.name;
  const periodLabel = PERIODS.find((p) => p.id === period)!.label.toLowerCase();
  const when = period === "all" ? "in total" : periodLabel;
  const count = `${rows.length} ${rows.length === 1 ? "entry" : "entries"}`;
  // What narrows the list, for the count and the empty message: “milk” and the filters.
  const narrowing = [search && `“${search}”`, activeFilters.length > 0 && "the filters"].filter(Boolean).join(" and ");
  const inPeriod = period === "all" ? "" : ` ${periodLabel}`;

  /** The current page's URL without one filter (or all of them), for the chips' remove links. */
  const hrefWithout = (keys: readonly string[]) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (typeof value === "string" && !keys.includes(key)) params.set(key, value);
    }
    const text = params.toString();
    return `/venues/${venue.id}/changelog${text ? `?${text}` : ""}`;
  };

  return (
    <>
      <div className={styles.header}>
        <h1 className={styles.title}>Change log</h1>
        <p className={styles.sub}>
          All edits across {venueLabel === "all venues" ? "all venues'" : `${venueLabel}'s`} events, newest first ·{" "}
          {/* Announced as the results change, e.g. while searching. */}
          <span role="status">
            {narrowing ? `${count} ${rows.length === 1 ? "matches" : "match"} ${narrowing}${inPeriod}` : `${count} ${when}`}
          </span>
        </p>
        {/* As in the prototype: issue this venue's archive early (Supervisor, F&B Manager), or open it once issued. */}
        {canGenerateArchive(user.role) && (
          <div className={styles.archiveAction}>
            {thisMonthArchive ? (
              <Link href={`/venues/${venue.id}/archive/${thisMonthArchive.ref}`} className="btn btn-secondary btn-sm">
                Open this month&apos;s archive
              </Link>
            ) : (
              <GenerateEarly
                venueId={venue.id}
                label="Generate this month's archive early"
                {...earlyArchiveWording(today)}
              />
            )}
            <span className={styles.archiveHint}>
              {thisMonthArchive
                ? `Generated ${formatDayShort(thisMonthArchive.generatedAt.slice(0, 10))} · ${thisMonthArchive.generatedAt.slice(11, 16)}`
                : `Full archive issues ${earlyArchiveWording(today).issueDay}`}
            </span>
          </div>
        )}
      </div>

      <ChangelogControls
        search={search}
        period={period}
        venue={multiVenue ? venueChoice : null}
        // Unavailable venues are listed but can't be chosen, as in the prototype.
        venues={VENUES.map((v) => ({ id: v.id, name: v.name, available: v.available }))}
        filters={filters}
        options={options}
      />

      {activeFilters.length > 0 && (
        <ul className={styles.chips} aria-label="Active filters">
          {activeFilters.map((key) => (
            <li key={key}>
              <Link
                href={hrefWithout([key])}
                scroll={false}
                className={styles.chip}
                aria-label={`Remove filter ${FILTER_LABELS[key]}: ${options[key].find((o) => o.value === filters[key])!.label}`}
              >
                {FILTER_LABELS[key]}: {options[key].find((o) => o.value === filters[key])!.label}
                <span aria-hidden="true"> ✕</span>
              </Link>
            </li>
          ))}
          {activeFilters.length > 1 && (
            <li>
              <Link href={hrefWithout(FILTER_KEYS)} scroll={false} className={styles.clearChips}>
                Clear filters
              </Link>
            </li>
          )}
        </ul>
      )}

      {rows.length === 0 ? (
        <p className={styles.empty}>
          {narrowing
            ? `No entries match ${narrowing}${inPeriod}.${period === "all" ? "" : " Try a longer period."}`
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

/**
 * Person, role and event choices from the entries in scope, as in the prototype.
 * Roles follow the usual order; events are listed by name (with the venue when
 * showing all venues) but chosen by id, so two events with one name stay apart.
 */
function filterOptions(rows: readonly Row[], showVenue: boolean): FilterOptions {
  const byLabel = (a: FilterOption, b: FilterOption) => a.label.localeCompare(b.label, "en-GB");
  const unique = (values: string[]) => [...new Set(values)].map((value) => ({ value, label: value }));
  const roleOrder = [...ROLES, "Automatic"] as string[];
  const events = new Map<string, FilterOption>();
  for (const row of rows) {
    const venueName = VENUES.find((v) => v.id === row.venueId)!.name;
    events.set(row.eventId, { value: row.eventId, label: showVenue ? `${row.eventName} · ${venueName}` : row.eventName });
  }
  return {
    person: unique(rows.map((r) => r.name)).sort(byLabel),
    role: unique(rows.map((r) => r.role)).sort((a, b) => roleOrder.indexOf(a.value) - roleOrder.indexOf(b.value)),
    event: [...events.values()].sort(byLabel),
  };
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
