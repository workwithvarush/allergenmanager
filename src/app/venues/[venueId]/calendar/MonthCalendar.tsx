"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type KeyboardEvent } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { addDays, addMonths, daysOfMonth, formatMonth, isIsoDate, monthOf, weekdayIndex } from "@/lib/dates";
import { eventDateLabel, eventLane, eventOnDay, menuLabel, type AllergenEvent } from "@/lib/events";
import { formatDayLong } from "@/lib/venue-time";
import { NewEventDialog } from "../NewEventDialog";
import styles from "./Calendar.module.css";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
/** Event names shown in a day cell before "+N more". */
const CELL_EVENTS = 2;
/** Arrow keys move the selected day like a paper calendar. */
const ARROW_DAYS: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };

type MonthCalendarProps = {
  venueId: string;
  /** Today in UK time, "2026-10-15". */
  today: string;
  /** The month shown, "2026-10". */
  month: string;
  /** The selected day from the URL when the page was requested. */
  initialDay: string;
  /** Events running on any day of the month, sorted by date and service time. */
  events: readonly AllergenEvent[];
  canCreate: boolean;
  /** EMCC picks a standard menu; Bramleys builds every menu dish by dish. */
  standardMenus: boolean;
  /** Whether new events can use a custom menu instead of a standard one. */
  canCustomMenu: boolean;
};

/** Month grid beside the selected day's events, as in the prototype's calendar. */
export function MonthCalendar({
  venueId,
  today,
  month,
  initialDay,
  events,
  canCreate,
  standardMenus,
  canCustomMenu,
}: MonthCalendarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState<string | null>(null);
  // Selecting a day only rewrites the URL (no server round trip), so read it back from there.
  const dayParam = searchParams.get("day");
  const selected = isIsoDate(dayParam) && monthOf(dayParam) === month ? dayParam : initialDay;

  const days = daysOfMonth(month);
  const leading = weekdayIndex(days[0]);
  const trailing = (7 - ((leading + days.length) % 7)) % 7;
  const eventsOn = (day: string) => events.filter((event) => eventOnDay(event, day));
  const dayEvents = eventsOn(selected);

  const base = `/venues/${venueId}/calendar`;
  const select = (day: string) => {
    setCreated(null);
    window.history.replaceState(null, "", `?month=${month}&day=${day}`);
  };

  // The new event's own page doesn't exist yet, so stay here and show it on its day.
  const onCreated = (event: { name: string; date: string }) => {
    setCreating(false);
    if (monthOf(event.date) === month) select(event.date);
    else router.push(`${base}?month=${monthOf(event.date)}&day=${event.date}`, { scroll: false });
    setCreated(`${event.name} created for ${formatDayLong(event.date)}.`);
  };

  const onGridKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = ARROW_DAYS[e.key];
    if (step === undefined) return;
    const next = addDays(selected, step);
    if (monthOf(next) !== month) return;
    e.preventDefault();
    select(next);
    e.currentTarget.querySelector<HTMLButtonElement>(`[data-day="${next}"]`)?.focus();
  };

  return (
    <>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Calendar</h1>
          <p className={styles.sub}>
            Every event this month. Select a day to see its schedule{canCreate ? " or add an event." : "."}
          </p>
        </div>
        <nav className={styles.monthNav} aria-label="Month">
          <Link
            href={`${base}?month=${addMonths(month, -1)}`}
            className={`btn btn-secondary ${styles.navButton}`}
            aria-label="Previous month"
            scroll={false}
          >
            ‹
          </Link>
          <h2 className={styles.monthLabel} aria-live="polite">
            {formatMonth(month)}
          </h2>
          <Link
            href={`${base}?month=${addMonths(month, 1)}`}
            className={`btn btn-secondary ${styles.navButton}`}
            aria-label="Next month"
            scroll={false}
          >
            ›
          </Link>
          <Link
            href={`${base}?month=${monthOf(today)}&day=${today}`}
            className="btn btn-secondary btn-sm"
            scroll={false}
          >
            Today
          </Link>
        </nav>
      </div>

      <div className={styles.layout}>
        <div className={styles.monthCard}>
          <div className={styles.weekdays} aria-hidden="true">
            {WEEKDAYS.map((weekday) => (
              <div key={weekday}>{weekday}</div>
            ))}
          </div>
          <div className={styles.days} onKeyDown={onGridKeyDown}>
            {Array.from({ length: leading }, (_, i) => (
              <div key={`lead-${i}`} aria-hidden="true" />
            ))}
            {days.map((day) => {
              const onDay = eventsOn(day);
              const isSelected = day === selected;
              const isToday = day === today;
              return (
                <button
                  key={day}
                  type="button"
                  data-day={day}
                  className={`${styles.day} ${isSelected ? styles.daySelected : ""}`}
                  aria-pressed={isSelected}
                  aria-current={isToday ? "date" : undefined}
                  aria-label={`${formatDayLong(day)}, ${onDay.length ? `${onDay.length} ${onDay.length === 1 ? "event" : "events"}` : "no events"}${isToday ? ", today" : ""}`}
                  // One tab stop for the grid; arrow keys move within it.
                  tabIndex={isSelected ? 0 : -1}
                  onClick={() => select(day)}
                >
                  <span className={styles.dayHead}>
                    <span className={isToday ? styles.todayNumber : styles.dayNumber}>{Number(day.slice(8))}</span>
                    {onDay.length > 0 && <span className={styles.dayCount}>{onDay.length}</span>}
                  </span>
                  {onDay.length > 0 && (
                    <span className={styles.dayEvents}>
                      {onDay.slice(0, CELL_EVENTS).map((event) => (
                        <span key={event.id} className={styles.dayEvent}>
                          {event.time}&nbsp;&nbsp;{event.name}
                        </span>
                      ))}
                      {onDay.length > CELL_EVENTS && (
                        <span className={styles.dayMore}>+{onDay.length - CELL_EVENTS} more</span>
                      )}
                      <span className={styles.dayDot} />
                    </span>
                  )}
                </button>
              );
            })}
            {Array.from({ length: trailing }, (_, i) => (
              <div key={`trail-${i}`} aria-hidden="true" />
            ))}
          </div>
        </div>

        <section className={styles.dayPanel} aria-labelledby="calendar-day">
          <div className={styles.dayPanelHead}>
            <div>
              <h2 id="calendar-day" className={styles.dayTitle}>
                {formatDayLong(selected)}
              </h2>
              <p className={styles.dayMeta}>
                {dayEvents.length
                  ? `${dayEvents.length} ${dayEvents.length === 1 ? "event" : "events"}`
                  : "No events"}
                {selected === today ? " · today" : ""}
              </p>
            </div>
            {canCreate && (
              <button type="button" className="btn btn-primary btn-sm" onClick={() => setCreating(true)}>
                + New event
              </button>
            )}
          </div>

          <div role="status">
            {created && <div className={`banner banner-success ${styles.created}`}>{created}</div>}
          </div>

          {dayEvents.length === 0 ? (
            <div className={styles.empty}>
              {canCreate ? "Nothing scheduled. Create an event for this day." : "Nothing scheduled for this day."}
            </div>
          ) : (
            <ul className={styles.eventList}>
              {dayEvents.map((event) => (
                <li key={event.id}>
                  <Link href={`/venues/${venueId}/events/${event.id}`} prefetch={false} className={styles.event}>
                    <span className={styles.eventTop}>
                      <span className={styles.eventTime}>{event.time}</span>
                      <StatusBadge status={eventLane(event)} pill />
                    </span>
                    <span className={styles.eventName}>{event.name}</span>
                    <span className={styles.eventMeta}>
                      {event.room} · {menuLabel(event)} · {event.guests} guests · {eventDateLabel(event)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {!canCreate && (
            <p className={styles.readOnlyNote}>
              Only chefs, supervisors and F&amp;B managers can create events. Ask your supervisor to add one.
            </p>
          )}
        </section>
      </div>

      {creating && (
        <NewEventDialog
          venueId={venueId}
          defaultDate={selected}
          today={today}
          standardMenus={standardMenus}
          canCustomMenu={canCustomMenu}
          onClose={() => setCreating(false)}
          onCreated={onCreated}
        />
      )}
    </>
  );
}
