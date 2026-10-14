"use client";

import { useId } from "react";
import { canSwitchVenue } from "@/lib/permissions";
import type { Role } from "@/lib/roles";
import type { Venue } from "@/lib/venues";

type VenueSwitcherProps<V extends Venue> = {
  /** The signed-in user's role; the switcher is hidden unless they may switch venues. */
  role: Role;
  venues: readonly V[];
  /** The venue currently shown. */
  value: V["id"];
  onChange: (venueId: V["id"]) => void;
};

/**
 * "Venue" dropdown from the top of the prototype's dashboard (`.venue-switcher`
 * in kit.css). Shown to Supervisors and F&B Managers only; venues that aren't
 * available are listed but can't be chosen, with the reason alongside.
 */
export function VenueSwitcher<V extends Venue>({ role, venues, value, onChange }: VenueSwitcherProps<V>) {
  const id = useId();
  if (!canSwitchVenue(role)) return null;

  const unavailable = venues.filter((venue) => !venue.available);

  return (
    <div className="venue-switcher">
      <label className="field-label" htmlFor={id}>
        Venue
      </label>
      <select
        id={id}
        className="input"
        value={value}
        onChange={(event) => onChange(event.target.value as V["id"])}
        aria-describedby={unavailable.length ? `${id}-note` : undefined}
      >
        {venues.map((venue) => (
          <option key={venue.id} value={venue.id} disabled={!venue.available}>
            {venue.available ? venue.name : `${venue.name} — coming soon`}
          </option>
        ))}
      </select>
      {unavailable.length > 0 && (
        <span id={`${id}-note`} className="venue-switcher-note">
          {unavailable.map((venue) => `${venue.name}: ${venue.unavailableReason ?? "not available yet."}`).join(" ")}
        </span>
      )}
    </div>
  );
}
