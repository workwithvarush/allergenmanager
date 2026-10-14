"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/Button";
import { Dialog } from "@/components/Dialog";
import { ProgressBar } from "@/components/ProgressBar";
import { StatusBadge } from "@/components/StatusBadge";
import {
  dishesDone,
  dishesWithEntries,
  eventLane,
  printBlockedReason,
  timeToService,
  type AllergenEvent,
} from "@/lib/events";
import { STANDARD_MENUS, type StandardMenu } from "@/lib/menus";
import { canFlagForReprint } from "@/lib/permissions";
import type { Role } from "@/lib/roles";
import styles from "./EventDetail.module.css";

type EventDetailProps = {
  event: AllergenEvent;
  venueId: string;
  role: Role;
  /** Current UK time "HH:mm", or null before hydration. */
  now: string | null;
  onChangeMenu: (menu: StandardMenu) => void;
  onToggleFlag: () => void;
};

/** The selected event: status, progress, assigned menu and actions — as in the prototype's dashboard. */
export function EventDetail({ event, venueId, role, now, onChangeMenu, onToggleFlag }: EventDetailProps) {
  const [pendingMenu, setPendingMenu] = useState<StandardMenu | null>(null);

  const lane = eventLane(event);
  const done = dishesDone(event);
  const total = event.dishes.length;
  const blocked = printBlockedReason(event);
  const relative = now ? timeToService(event.time, now) : null;
  const printed = event.lastPrintedAt !== null;
  const eventHref = `/venues/${venueId}/events/${event.id}`;

  const requestMenu = (menu: StandardMenu) => {
    if (menu.id === event.menuId) return;
    // Only ask when switching would throw away allergen work.
    if (dishesWithEntries(event) > 0) setPendingMenu(menu);
    else onChangeMenu(menu);
  };

  const entered = dishesWithEntries(event);

  return (
    <section className={styles.panel} aria-labelledby={`${event.id}-title`}>
      <div className={styles.head}>
        <div>
          <h2 id={`${event.id}-title`} className={styles.name}>
            {event.name}
          </h2>
          <div className={styles.meta}>
            {event.room} · {event.time} · {event.guests} guests{relative && ` · ${relative.text}`}
          </div>
        </div>
        <StatusBadge status={lane} />
      </div>

      <div className={styles.progress}>
        <ProgressBar
          value={done}
          max={total}
          label={`${done} of ${total} dishes completed`}
          detail={`v${event.version} · edited ${event.lastModifiedAt}`}
        />
      </div>

      {lane === "reprint" && (
        <div className={`banner banner-warn ${styles.warn}`}>
          <div className="banner-body">
            {event.version !== event.lastPrintedVersion
              ? `Edits made after last print at ${event.lastPrintedAt}. Counters still hold v${event.lastPrintedVersion}.`
              : `Flagged for reprint after the ${event.lastPrintedAt} print.`}
          </div>
        </div>
      )}

      {event.menuId ? (
        <>
          <fieldset className={styles.menus}>
            <legend className={styles.sectionLabel}>Assigned menu</legend>
            {STANDARD_MENUS.map((menu) => {
              const current = menu.id === event.menuId;
              return (
                <button
                  key={menu.id}
                  type="button"
                  className={styles.menuCard}
                  aria-pressed={current}
                  onClick={() => requestMenu(menu)}
                >
                  <span className={styles.menuTitle}>{menu.name}</span>
                  <span className={styles.menuMeta}>{menu.dishes.length} dishes</span>
                  {current && <span className={styles.menuCurrent}>✓ Currently assigned</span>}
                </button>
              );
            })}
          </fieldset>
          <p className={styles.menuNote}>
            Switching menu replaces the dish list and resets allergen entry for this event.
          </p>
        </>
      ) : (
        <>
          <h3 className={styles.sectionLabel} style={{ marginBottom: 8 }}>
            Menu
          </h3>
          <p className={styles.dishSummary}>
            {event.menuName ? `${event.menuName} · ` : ""}
            {total} custom {total === 1 ? "dish" : "dishes"} for this event
          </p>
        </>
      )}

      <div className={styles.actions}>
        <Link href={eventHref} prefetch={false} className="btn btn-primary">
          {done === total ? "Review allergens" : "Fill allergens"}
        </Link>
        {blocked ? (
          <Button variant="gold" disabled aria-describedby={`${event.id}-blocked`}>
            {lane === "reprint" ? "Reprint all 3" : "Preview & print"}
          </Button>
        ) : (
          <Link href={`${eventHref}/print`} prefetch={false} className="btn btn-gold">
            {lane === "reprint" ? "Reprint all 3" : "Preview & print"}
          </Link>
        )}
        {canFlagForReprint(role) && (
          <Button
            variant="secondary"
            className={event.flagged ? styles.flagged : undefined}
            disabled={!printed}
            aria-describedby={printed ? undefined : `${event.id}-unprinted`}
            onClick={onToggleFlag}
          >
            {event.flagged ? "Clear reprint flag" : "Flag for reprint"}
          </Button>
        )}
      </div>
      {blocked && (
        <p id={`${event.id}-blocked`} className={styles.blocked}>
          {blocked}
        </p>
      )}
      {canFlagForReprint(role) && !printed && (
        <p id={`${event.id}-unprinted`} className={styles.blocked}>
          This event has never been printed, so there is nothing to reprint.
        </p>
      )}

      <Dialog
        open={pendingMenu !== null}
        onClose={() => setPendingMenu(null)}
        title={pendingMenu ? `Switch ${event.name} to ${pendingMenu.name}?` : ""}
        footer={
          <>
            <Button variant="secondary" onClick={() => setPendingMenu(null)} data-autofocus>
              Keep current menu
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (pendingMenu) onChangeMenu(pendingMenu);
                setPendingMenu(null);
              }}
            >
              Replace dish list
            </Button>
          </>
        }
      >
        {pendingMenu && (
          <>
            <p className="t-body" style={{ margin: 0, color: "var(--fg-3)", lineHeight: 1.55 }}>
              The current dish list will be replaced with the {pendingMenu.name} dish list.
            </p>
            <div className="banner banner-warn">
              <div className="banner-body">
                {entered} {entered === 1 ? "dish already has" : "dishes already have"} allergen entry. That work
                will be discarded and cannot be recovered.
              </div>
            </div>
          </>
        )}
      </Dialog>
    </section>
  );
}

/** Shown in the panel's place when the venue has no events today. */
export function EventDetailEmpty() {
  return (
    <div className={styles.empty}>
      <div className={styles.emptyTitle}>No events yet</div>
      <div className={styles.emptyText}>Create the first event to get started.</div>
    </div>
  );
}
