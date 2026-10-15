"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/Button";
import { formatDayShort, monthOf } from "@/lib/dates";
import { isPrintedCurrent, sortByServiceTime, type AllergenEvent } from "@/lib/events";
import type { StandardMenu } from "@/lib/menus";
import { canCreateCustomMenu, canCreateEvents } from "@/lib/permissions";
import type { Role } from "@/lib/roles";
import { useVenueClock } from "@/lib/useVenueClock";
import { formatDayLong } from "@/lib/venue-time";
import { usesStandardMenus, type VenueId } from "@/lib/venues";
import { changeMenu as saveMenuChange } from "../events/[eventId]/actions";
import { NewEventDialog } from "../NewEventDialog";
import { DashboardStats } from "./DashboardStats";
import { EventDetail, EventDetailEmpty } from "./EventDetail";
import { EventFilters, EventList, matchesFilter, type Filter } from "./EventList";
import { ReprintBanner } from "./ReprintBanner";
import styles from "./Dashboard.module.css";

type DashboardProps = {
  venueId: VenueId;
  role: Role;
  /** Today in UK time, e.g. "2026-05-20". */
  today: string;
  /** Today's events, sorted by service time. */
  initialEvents: AllergenEvent[];
  /** Other venues' events today, for roles that see totals across venues. */
  otherVenueEvents?: AllergenEvent[];
  /** The venue's menus that can be chosen (not retired), as edited in Menus. */
  menus: StandardMenu[];
};

/**
 * Today's events beside the selected event's details. Edits (menu change,
 * reprint flag) are held in the browser until there is a backend to save them.
 */
export function Dashboard({ venueId, role, today, initialEvents, otherVenueEvents, menus }: DashboardProps) {
  const now = useVenueClock();
  const [events, setEvents] = useState(initialEvents);
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(initialEvents[0]?.id ?? null);
  const [creating, setCreating] = useState(false);
  const [menuError, setMenuError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ name: string; date: string } | null>(null);

  // The server sends a fresh list after an event is created or edited elsewhere (e.g. allergen entry).
  // Take new events and newer versions, keeping this page's unsaved edits to the rest.
  const [prevInitialEvents, setPrevInitialEvents] = useState(initialEvents);
  if (initialEvents !== prevInitialEvents) {
    setPrevInitialEvents(initialEvents);
    setEvents((current) =>
      sortByServiceTime([
        ...current.map((c) => {
          const incoming = initialEvents.find((e) => e.id === c.id);
          return incoming && incoming.version > c.version ? incoming : c;
        }),
        ...initialEvents.filter((e) => !current.some((c) => c.id === e.id)),
      ]),
    );
  }

  const onCreated = (event: { id: string; name: string; date: string }) => {
    setCreating(false);
    setCreated(event);
    // A new event for today appears in the list (it arrives with the refreshed page); select it.
    if (event.date === today) {
      setFilter("all");
      setSelectedId(event.id);
    }
  };

  const visible = events.filter((event) => matchesFilter(event, filter));
  // If the selection isn't visible (e.g. an edit moved it to another lane), show the first visible event.
  const selected =
    visible.find((e) => e.id === selectedId) ?? visible[0] ?? events.find((e) => e.id === selectedId) ?? events[0];

  // As in the prototype: a filter that hides the selected event moves the selection to its first event,
  // so going back to "All" doesn't jump to the event selected before.
  const changeFilter = (next: Filter) => {
    const nextVisible = events.filter((event) => matchesFilter(event, next));
    if (!nextVisible.some((event) => event.id === selected?.id)) setSelectedId(nextVisible[0]?.id ?? selectedId);
    setFilter(next);
  };

  const updateEvent = (id: string, change: (event: AllergenEvent) => AllergenEvent) =>
    setEvents((current) => current.map((event) => (event.id === id ? change(event) : event)));

  /** Saves the switch on the server, then shows the new (empty) dish list it returns. */
  const changeMenu = async (menu: StandardMenu) => {
    if (!selected) return;
    const id = selected.id;
    setMenuError(null);
    const result = await saveMenuChange(venueId, id, menu.id).catch(() => ({
      ok: false as const,
      message: "the server could not be reached.",
    }));
    if (!result.ok) {
      setMenuError(`Menu not changed — ${result.message.charAt(0).toLowerCase()}${result.message.slice(1)}`);
      return;
    }
    const { menuId, menuName, dishes, version, lastModifiedAt } = result;
    updateEvent(id, (event) => ({ ...event, menuId, menuName, dishes, version, lastModifiedAt }));
  };

  const toggleFlag = () => selected && updateEvent(selected.id, (event) => ({ ...event, flagged: !event.flagged }));

  const printed = events.filter(isPrintedCurrent).length;

  return (
    <>
      <div className={`${styles.header} ${styles.headerRow}`}>
        <div>
          <h1 className={styles.title}>Today&apos;s events</h1>
          <p className={styles.sub}>
            {formatDayLong(today)} · {events.length} {events.length === 1 ? "event" : "events"} · {printed} of{" "}
            {events.length} printed
          </p>
        </div>
        <div className={styles.headerActions}>
          <Link
            href={`/venues/${venueId}/calendar?month=${monthOf(today)}&day=${today}`}
            className="btn btn-secondary"
            aria-label={`Today · ${formatDayShort(today)}, open calendar`}
            data-tour="today"
          >
            Today · {formatDayShort(today)}
          </Link>
          {canCreateEvents(role) && (
            <Button onClick={() => setCreating(true)} data-tour="new-event">
              + New event
            </Button>
          )}
        </div>
      </div>
      <div role="alert">
        {menuError && (
          <div className={`banner banner-danger ${styles.created}`}>
            <div className="banner-body">{menuError}</div>
          </div>
        )}
      </div>
      <div role="status">
        {created && (
          <div className={`banner banner-success ${styles.created}`}>
            <div className="banner-body">
              {created.name} created for {created.date === today ? "today" : formatDayLong(created.date)}.
            </div>
            {created.date !== today && (
              <Link
                href={`/venues/${venueId}/calendar?month=${monthOf(created.date)}&day=${created.date}`}
                className="btn btn-secondary btn-sm banner-action"
              >
                View in calendar
              </Link>
            )}
          </div>
        )}
      </div>
      <ReprintBanner venueId={venueId} events={events} />
      <DashboardStats
        role={role}
        events={events}
        allVenueEvents={otherVenueEvents && [...events, ...otherVenueEvents]}
      />
      <EventFilters events={events} filter={filter} onFilterChange={changeFilter} />
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
            menus={menus}
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

      {creating && (
        <NewEventDialog
          menus={menus}
          venueId={venueId}
          defaultDate={today}
          today={today}
          standardMenus={usesStandardMenus(venueId)}
          canCustomMenu={canCreateCustomMenu(role)}
          onClose={() => setCreating(false)}
          onCreated={onCreated}
        />
      )}
    </>
  );
}
