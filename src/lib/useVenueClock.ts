"use client";

import { useSyncExternalStore } from "react";
import { venueTime } from "@/lib/venue-time";

function subscribe(onChange: () => void) {
  const timer = setInterval(onChange, 30_000);
  return () => clearInterval(timer);
}

/**
 * Current UK time as "HH:mm", refreshed every 30 seconds. Null during server
 * rendering and hydration, so relative times ("in 45 min") never mismatch.
 */
export function useVenueClock(): string | null {
  return useSyncExternalStore(
    subscribe,
    () => venueTime(new Date()),
    () => null,
  );
}
