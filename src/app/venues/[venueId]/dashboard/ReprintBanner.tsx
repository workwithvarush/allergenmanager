import Link from "next/link";
import { eventLane, type AllergenEvent } from "@/lib/events";
import styles from "./ReprintBanner.module.css";

type ReprintBannerProps = {
  venueId: string;
  /** Today's events, sorted by service time — "Open first" opens the earliest one needing a reprint. */
  events: readonly AllergenEvent[];
};

/**
 * Warns when printed sheets are out of date, as in the prototype's dashboard.
 * The container is always rendered so a new reprint (e.g. after flagging) is announced.
 */
export function ReprintBanner({ venueId, events }: ReprintBannerProps) {
  const reprint = events.filter((event) => eventLane(event) === "reprint");
  const first = reprint[0];

  return (
    <div role="status" className={first ? styles.wrap : undefined}>
      {first && (
        <div className={`banner banner-warn ${styles.banner}`}>
          <svg
            className="banner-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <div className="banner-body">
            <div className="banner-title">
              {reprint.length} {reprint.length === 1 ? "event needs" : "events need"} reprinting
            </div>
            <div className={styles.detail}>
              {reprint.map((event) => event.name).join(" · ")} — allergen data has changed since the last print
            </div>
          </div>
          <Link
            href={`/venues/${venueId}/events/${first.id}/print`}
            prefetch={false}
            className="btn btn-gold btn-sm banner-action"
          >
            Open first<span className="sr-only">: {first.name} print preview</span>
          </Link>
        </div>
      )}
    </div>
  );
}
