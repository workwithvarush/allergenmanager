"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { formatDayShort } from "@/lib/dates";
import type { PostPrintAlerts } from "@/lib/notifications";
import { venueDate } from "@/lib/venue-time";
import { loadAlerts, markAlertsRead } from "./notifications";
import styles from "./NotificationsBell.module.css";

/** How often the bell checks for other people's changes while the page is open. */
const POLL_MS = 30_000;

type NotificationsBellProps = {
  venueId: string;
  /** The list when the page loaded; refreshed while the page is open. */
  initial: PostPrintAlerts;
};

/**
 * The prototype's bell: changes made to events after they were printed, so the
 * printed sheets at the counters are out of date. Amber with a count while
 * there are unread ones; opening it marks them read (they stay highlighted
 * until it closes). An alert opens that event's print preview.
 */
export function NotificationsBell({ venueId, initial }: NotificationsBellProps) {
  const [alerts, setAlerts] = useState(initial);
  const [open, setOpen] = useState(false);
  /** Alerts that were unread when the panel opened — still shown as new while it's open. */
  const [fresh, setFresh] = useState<ReadonlySet<string>>(new Set());
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const pathname = usePathname();

  const refresh = useCallback(async () => {
    try {
      setAlerts(await loadAlerts(venueId));
    } catch {
      // Offline or server busy: keep showing the last list; the next check tries again.
    }
  }, [venueId]);

  // Check on page changes, every 30 seconds while the tab is visible, and on coming back to the tab.
  useEffect(() => {
    const first = setTimeout(() => void refresh(), 0);
    const timer = setInterval(() => document.visibilityState === "visible" && void refresh(), POLL_MS);
    const onVisible = () => document.visibilityState === "visible" && void refresh();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh, pathname]);

  const close = (returnFocus: boolean) => {
    setOpen(false);
    setFresh(new Set());
    if (returnFocus) buttonRef.current?.focus();
  };

  const openPanel = async () => {
    setOpen(true);
    let latest = alerts;
    try {
      latest = await loadAlerts(venueId);
    } catch {
      // Show what we have.
    }
    const unreadIds = latest.items.filter((a) => a.unread).map((a) => a.id);
    setFresh(new Set(unreadIds));
    setAlerts({ items: latest.items.map((a) => ({ ...a, unread: false })), unread: 0 });
    if (unreadIds.length) void markAlertsRead(venueId, unreadIds).catch(() => {});
  };

  // Close on a click elsewhere or Esc.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!panelRef.current?.contains(target) && !buttonRef.current?.contains(target)) close(false);
    };
    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && close(true);
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const today = venueDate(new Date());
  const when = (at: string) =>
    at.slice(0, 10) === today ? at.slice(11, 16) : `${formatDayShort(at.slice(0, 10))} · ${at.slice(11, 16)}`;

  return (
    <div className={styles.bellWrap}>
      <button
        ref={buttonRef}
        type="button"
        className={`${styles.bell} ${alerts.unread ? styles.hasUnread : ""}`}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`Post-print changes${alerts.unread ? `, ${alerts.unread} unread` : ""}`}
        title="Post-print change alerts"
        data-tour="bell"
        onClick={() => (open ? close(false) : void openPanel())}
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M10 5a2 2 0 1 1 4 0 7 7 0 0 1 4 6v3a4 4 0 0 0 2 3H4a4 4 0 0 0 2-3v-3a7 7 0 0 1 4-6" />
          <path d="M9 17v1a3 3 0 0 0 6 0v-1" />
        </svg>
        {alerts.unread > 0 && (
          <span className={styles.count} aria-hidden="true">
            {alerts.unread > 9 ? "9+" : alerts.unread}
          </span>
        )}
      </button>
      {open && (
        <div ref={panelRef} id={panelId} className={styles.panel} role="region" aria-label="Post-print changes">
          <div className={styles.panelHead}>
            <span className={styles.panelTitle}>Post-print changes</span>
            <span className={styles.panelNote}>Printed sheets now out of date</span>
          </div>
          {alerts.items.length === 0 ? (
            <p className={styles.empty}>
              No changes since the last print. Alerts appear here when a printed event is edited.
            </p>
          ) : (
            <ul className={styles.list}>
              {alerts.items.map((alert) => {
                const isNew = fresh.has(alert.id);
                return (
                  <li key={alert.id}>
                    <Link
                      href={`/venues/${venueId}/events/${alert.eventId}/print`}
                      prefetch={false}
                      className={styles.item}
                      onClick={() => close(false)}
                    >
                      <span className={`${styles.dot} ${isNew ? styles.dotNew : ""}`} aria-hidden="true" />
                      <span className={styles.itemBody}>
                        <span className={styles.itemText}>
                          {isNew && <span className="sr-only">New: </span>}
                          {alert.text}
                        </span>
                        <span className={styles.itemEvent}>{alert.eventName}</span>
                        <span className={styles.itemMeta}>
                          {when(alert.at)} · {alert.person}, {alert.role}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
