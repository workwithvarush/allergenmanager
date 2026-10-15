import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { LoadingPlaceholder, Skeleton } from "@/components/Skeleton";
import { daysOfMonth, isIsoDate, isIsoMonth, monthOf } from "@/lib/dates";
import { getEventsBetween } from "@/lib/demo-data";
import { sortByServiceTime } from "@/lib/events";
import { canCreateCustomMenu, canCreateEvents } from "@/lib/permissions";
import { getSessionUser } from "@/lib/session";
import { venueDate } from "@/lib/venue-time";
import { usesStandardMenus, VENUES } from "@/lib/venues";
import { MonthCalendar } from "./MonthCalendar";
import styles from "./Calendar.module.css";

export async function generateMetadata({ params }: PageProps<"/venues/[venueId]/calendar">): Promise<Metadata> {
  const { venueId } = await params;
  const venue = VENUES.find((v) => v.id === venueId);
  return { title: `Calendar · ${venue?.name ?? "Venue"} · Allergen Manager` };
}

/**
 * Month view of a venue's events. The month and selected day live in the URL
 * (`?month=2026-10&day=2026-10-21`) so Back, refresh and shared links keep them.
 */
export default function CalendarPage({ params, searchParams }: PageProps<"/venues/[venueId]/calendar">) {
  return (
    <div className={styles.screen}>
      <Suspense fallback={<CalendarLoading />}>
        <CalendarMonth params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function CalendarMonth({
  params,
  searchParams,
}: {
  params: Promise<{ venueId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ venueId: id }, query] = await Promise.all([params, searchParams]);
  const venue = VENUES.find((v) => v.id === id);
  if (!venue || !venue.available) notFound();
  await connection();
  const today = venueDate(new Date());

  // Bad or missing values fall back to this month, and to today (or the 1st in other months).
  const month = isIsoMonth(query.month) ? query.month : monthOf(today);
  const days = daysOfMonth(month);
  const day =
    isIsoDate(query.day) && monthOf(query.day) === month ? query.day : monthOf(today) === month ? today : days[0];

  const [user, events] = await Promise.all([
    getSessionUser(),
    getEventsBetween(venue.id, days[0], days[days.length - 1]),
  ]);

  return (
    <MonthCalendar
      venueId={venue.id}
      today={today}
      month={month}
      initialDay={day}
      events={sortByServiceTime(events)}
      canCreate={canCreateEvents(user.role)}
      standardMenus={usesStandardMenus(venue.id)}
      canCustomMenu={canCreateCustomMenu(user.role)}
    />
  );
}

function CalendarLoading() {
  return (
    <LoadingPlaceholder label="Loading calendar">
      <div className={styles.header}>
        <h1 className={styles.title}>Calendar</h1>
        <Skeleton width={260} height={12} style={{ marginTop: 8 }} />
      </div>
      <div className={styles.layout}>
        <Skeleton height={520} style={{ borderRadius: 12 }} />
        <Skeleton height={240} style={{ borderRadius: 12 }} />
      </div>
    </LoadingPlaceholder>
  );
}
