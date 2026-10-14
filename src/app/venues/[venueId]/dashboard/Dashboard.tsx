"use client";

import { useState } from "react";
import { isPrintedCurrent, type AllergenEvent } from "@/lib/events";
import { instantiateMenu, type StandardMenu } from "@/lib/menus";
import type { Role } from "@/lib/roles";
import { useVenueClock } from "@/lib/useVenueClock";
import { venueTime } from "@/lib/venue-time";
import { DashboardStats } from "./DashboardStats";
import { EventDetail, EventDetailEmpty } from "./EventDetail";
import { EventFilters, EventList, matchesFilter, type Filter } from "./EventList";
import styles from "./Dashboard.module.css";

type DashboardProps = {
  venueId: string;
  role: Role;
  /** e.g. "Wednesday 20 May". */
  dayLabel: string;
  /** Today's events, sorted by service time. */
  initialEvents: AllergenEvent[];
  /** Other venues' events today, for roles that see totals across venues. */
  otherVenueEvents?: AllergenEvent[];
};

/**
 * Today's events beside the selected event's details. Edits (menu change,
 * reprint flag) are held in the browser until there is a backend to save them.
 */
export function Dashboard({ venueId, role, dayLabel, initialEvents, otherVenueEvents }: DashboardProps) {
  const now = useVenueClock();
  const [events, setEvents] = useState(initialEvents);
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(initialEvents[0]?.id ?? null);

  const visible = events.filter((event) => matchesFilter(event, filter));
  // As in the prototype: if the filter hides the selection, show the first visible event instead.
  const selected =
    visible.find((e) => e.id === selectedId) ?? visible[0] ?? events.find((e) => e.id === selectedId) ?? events[0];

  const updateEvent = (id: string, change: (event: AllergenEvent) => AllergenEvent) =>
    setEvents((current) => current.map((event) => (event.id === id ? change(event) : event)));

  const changeMenu = (menu: StandardMenu) =>
    selected &&
    updateEvent(selected.id, (event) => ({
      ...event,
      menuId: menu.id,
      dishes: instantiateMenu(menu),
      version: event.version + 1,
      lastModifiedAt: venueTime(new Date()),
    }));

  const toggleFlag = () => selected && updateEvent(selected.id, (event) => ({ ...event, flagged: !event.flagged }));

  const printed = events.filter(isPrintedCurrent).length;

  return (
    <>
      <div className={styles.header}>
        <h1 className={styles.title}>Today&apos;s events</h1>
        <p className={styles.sub}>
          {dayLabel} · {events.length} {events.length === 1 ? "event" : "events"} · {printed} of {events.length} printed
        </p>
      </div>
      <DashboardStats
        role={role}
        events={events}
        allVenueEvents={otherVenueEvents && [...events, ...otherVenueEvents]}
      />
      <EventFilters events={events} filter={filter} onFilterChange={setFilter} />
      <div className={styles.grid}>
        <EventList
          visible={visible}
          noEvents={events.length === 0}
          filter={filter}
          selectedId={selected?.id ?? null}
          onSelect={setSelectedId}
          now={now}
        />
        {selected ? (
          <EventDetail
            key={selected.id}
            event={selected}
            venueId={venueId}
            role={role}
            now={now}
            onChangeMenu={changeMenu}
            onToggleFlag={toggleFlag}
          />
        ) : (
          <EventDetailEmpty />
        )}
      </div>
    </>
  );
}
