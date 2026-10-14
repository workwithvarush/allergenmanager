"use client";

import { useState } from "react";
import { Select } from "@/components/Select";
import { VenueSwitcher } from "@/components/VenueSwitcher";
import { ROLES, type Role } from "@/lib/roles";
import { VENUES, type VenueId } from "@/lib/venues";

export function VenueSwitcherDemo() {
  const [role, setRole] = useState<Role>("Supervisor");
  const [venueId, setVenueId] = useState<VenueId>("emcc");
  const venue = VENUES.find((v) => v.id === venueId)!;

  return (
    <div className="card">
      <div style={{ maxWidth: 240, marginBottom: 16 }}>
        <Select
          label="Demo: signed-in role"
          options={ROLES.map((r) => ({ value: r, label: r }))}
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
        />
      </div>
      <VenueSwitcher role={role} venues={VENUES} value={venueId} onChange={setVenueId} />
      <p className="t-body" style={{ margin: 0 }} data-testid="showing">
        Dashboard showing {venue.name}.
      </p>
    </div>
  );
}
