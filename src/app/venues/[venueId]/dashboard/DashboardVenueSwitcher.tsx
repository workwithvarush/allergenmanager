"use client";

import { useRouter } from "next/navigation";
import { VenueSwitcher } from "@/components/VenueSwitcher";
import type { Role } from "@/lib/roles";
import { VENUES, type VenueId } from "@/lib/venues";

/** Venue switcher that moves to the chosen venue's dashboard. */
export function DashboardVenueSwitcher({ role, venueId }: { role: Role; venueId: VenueId }) {
  const router = useRouter();
  return (
    <VenueSwitcher
      role={role}
      venues={VENUES}
      value={venueId}
      onChange={(next) => router.push(`/venues/${next}/dashboard`)}
    />
  );
}
