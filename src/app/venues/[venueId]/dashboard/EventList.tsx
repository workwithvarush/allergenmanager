"use client";

import { FilterChips, type FilterChipOption } from "@/components/FilterChips";
import { StatusBadge } from "@/components/StatusBadge";
import {
  dishesDone,
  eventLane,
  isChangedSincePrint,
  timeToService,
  type AllergenEvent,
  type EventLane,
} from "@/lib/events";
import styles from "./EventList.module.css";

export type Filter = "all" | EventLane;

const FILTER_LABELS: Record<Filter, string> = {
  all: "All",
  incomplete: "Incomplete",
  reprint: "Reprint",
  ready: "Ready",
};

const FILTER_TONES = { all: "brand", incomplete: "danger", reprint: "warn", ready: "ready" } as const;

export function matchesFilter(event: AllergenEvent, filter: Filter): boolean {
  return filter === "all" || eventLane(event) === filter;
}

type EventFiltersProps = {
  events: readonly AllergenEvent[];
  filter: Filter;
  onFilterChange: (filter: Filter) => void;
};

/** All / Incomplete / Reprint / Ready chips with counts. */
export function EventFilters({ events, filter, onFilterChange }: EventFiltersProps) {
  const counts: Record<Filter, number> = { all: events.length, incomplete: 0, reprint: 0, ready: 0 };
  for (const event of events) counts[eventLane(event)] += 1;

  const options: FilterChipOption<Filter>[] = (Object.keys(FILTER_LABELS) as Filter[]).map((key) => ({
    value: key,
    label: FILTER_LABELS[key],
    count: counts[key],
    tone: FILTER_TONES[key],
  }));

  return (
    <FilterChips
      label="Filter events by status"
      options={options}
      value={filter}
      onChange={onFilterChange}
      meta="Sorted by service time"
    />
  );
}

type EventListProps = {
  /** Events passing the current filter, sorted by service time. */
  visible: readonly AllergenEvent[];
  /** True when the venue has no events at all today. */
  noEvents: boolean;
  filter: Filter;
  selectedId: string | null;
  onSelect: (id: string) => void;
  /** Current UK time "HH:mm", or null before hydration. */
  now: string | null;
};

/** Today's event rows, as in the prototype's dashboard. Clicking a row selects it. */
export function EventList({ visible, noEvents, filter, selectedId, onSelect, now }: EventListProps) {
  if (noEvents) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyTitle}>No events yet</div>
        <div className={styles.emptyText}>Create the first event to get started.</div>
      </div>
    );
  }
  if (visible.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyTitle}>Nothing in this lane</div>
        <div className={styles.emptyText}>
          No {FILTER_LABELS[filter].toLowerCase()} events for today. Switch filters or create a new event.
        </div>
      </div>
    );
  }

  return (
    <ul className={styles.rows} data-tour="event-rows">
      {visible.map((event) => {
        const lane = eventLane(event);
        const done = dishesDone(event);
        const total = event.dishes.length;
        const relative = now ? timeToService(event.time, now) : null;
        return (
          <li key={event.id}>
            <button
              type="button"
              className={styles.row}
              aria-pressed={event.id === selectedId}
              onClick={() => onSelect(event.id)}
            >
              <span className={styles.body}>
                <span className={styles.when}>
                  <span className={styles.time}>{event.time}</span>
                  <span className={styles.relative} data-tone={relative?.tone}>
                    {relative?.text}
                  </span>
                </span>
                <span className={styles.main}>
                  <span className={styles.name}>{event.name}</span>
                  <span className={styles.meta}>
                    {event.room} · {event.guests} guests · {done} of {total} {total === 1 ? "dish" : "dishes"} · v{event.version}
                    {event.lastPrintedAt && ` · printed ${event.lastPrintedAt}`}
                  </span>
                  {isChangedSincePrint(event) && (
                    <span className={styles.changed}>Changed since print · chef and supervisors emailed</span>
                  )}
                </span>
                <StatusBadge status={lane} pill />
              </span>
              <span className={styles.strip} aria-hidden="true">
                <span
                  className={styles.stripFill}
                  data-lane={done === total ? lane : undefined}
                  style={{ width: `${total ? (done / total) * 100 : 0}%` }}
                />
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
