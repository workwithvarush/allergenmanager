import { StatTile } from "@/components/StatTile";
import {
  allergensFlagged,
  isChangedSincePrint,
  isPendingReview,
  isPrintedCurrent,
  type AllergenEvent,
} from "@/lib/events";
import { canSeeAllVenues, canSeePendingReview } from "@/lib/permissions";
import type { Role } from "@/lib/roles";
import styles from "./Dashboard.module.css";

type DashboardStatsProps = {
  role: Role;
  /** This venue's events today. */
  events: readonly AllergenEvent[];
  /** Every venue's events today — only needed for roles that see all venues. */
  allVenueEvents?: readonly AllergenEvent[];
};

/** Summary tiles above the event list, as in the prototype's dashboard. */
export function DashboardStats({ role, events, allVenueEvents }: DashboardStatsProps) {
  const dishes = events.reduce((n, event) => n + event.dishes.length, 0);
  const printed = events.filter(isPrintedCurrent).length;

  return (
    <>
      {canSeeAllVenues(role) && allVenueEvents && (
        <section className={styles.statSection} aria-labelledby="across-venues">
          <h2 id="across-venues" className={styles.statHeading}>
            Across all venues
          </h2>
          <div className={styles.stats3}>
            <StatTile tone="outline" value={allVenueEvents.filter(isPendingReview).length} label="Pending review" />
            <StatTile
              tone="outline"
              value={allVenueEvents.filter((e) => e.lastPrintedAt !== null).length}
              label="Reviewed today"
            />
            <StatTile
              tone="outline"
              value={allVenueEvents.filter(isChangedSincePrint).length}
              label="Flagged for reprint"
            />
          </div>
        </section>
      )}

      <div className={styles.statRows}>
        <div className={styles.stats4}>
          <StatTile value={events.length} label="Events" />
          <StatTile value={dishes} label="Dishes" />
          <StatTile value={allergensFlagged(events)} label="Allergens flagged" />
          <StatTile value={`${printed}/${events.length}`} label="Print-ready" />
        </div>
        {canSeePendingReview(role) && (
          <div className={styles.stats4}>
            <StatTile tone="brand" value={events.filter(isPendingReview).length} label="Pending review" />
          </div>
        )}
      </div>
    </>
  );
}
