import type { Metadata } from "next";
import { AllergenLabel } from "@/components/AllergenLabel";
import { Button } from "@/components/Button";
import { NottinghamVenuesLogo } from "@/components/NottinghamVenuesLogo";
import { OfflineBanner } from "@/components/OfflineBanner";
import { ProgressBar } from "@/components/ProgressBar";
import { Select } from "@/components/Select";
import { LoadingPlaceholder, Skeleton } from "@/components/Skeleton";
import { StatTile } from "@/components/StatTile";
import { StatusBadge } from "@/components/StatusBadge";
import { TextField } from "@/components/TextField";
import { ALLERGENS } from "@/lib/allergens";
import { AppHeaderDemo } from "./AppHeaderDemo";
import { DialogDemo } from "./DialogDemo";
import { ErrorMessageDemo } from "./ErrorMessageDemo";
import { FilterChipsDemo } from "./FilterChipsDemo";
import { SaveStatusDemo } from "./SaveStatusDemo";
import { VenueSwitcherDemo } from "./VenueSwitcherDemo";

export const metadata: Metadata = {
  title: "Component showcase · Allergen Manager",
};

const ROOM_OPTIONS =["CS 1", "CS 2", "CS 3", "CS 4", "Banqueting suite", "Conference theatre", "Concourse", "Atrium"].map(
  (room) => ({ value: room, label: room }),
);

const VENUE_OPTIONS = [
  { value: "emcc", label: "EMCC" },
  { value: "bramleys", label: "Bramleys" },
  { value: "jubilee", label: "Jubilee (coming soon)", disabled: true },
];

export default function Home() {
  return (
    <main className="app-shell">
      <AppHeaderDemo />
      <div style={{ marginTop: 12 }}>
        <OfflineBanner />
      </div>
      <div style={{ marginTop: 12 }}>
        <VenueSwitcherDemo />
      </div>
      <div className="screen">
        <NottinghamVenuesLogo height={40} preload />
        <div className="screen-header" style={{ marginTop: 24 }}>
          <div>
            <h1 className="screen-title">Allergen Manager</h1>
            <p className="screen-sub">
              Design system loaded. The click-through reference lives in
              /prototype.
            </p>
          </div>
        </div>
        <div className="card">
          <p className="t-body">
            Tokens, UI kit and prototype styles come from
            src/styles/design-system.
          </p>
          <p className="t-mono">v1 · 14 Oct · 12:00</p>
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <StatusBadge status="incomplete" />
            <StatusBadge status="ready" />
            <StatusBadge status="reprint" />
            <StatusBadge status="pending-review" />
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <Button>Fill allergens</Button>
            <Button variant="secondary">Back to dashboard</Button>
            <button className="btn btn-gold">Print all 3 documents</button>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <Button disabled>Log in</Button>
            <Button variant="secondary" disabled>
              Cancel
            </Button>
            <DialogDemo />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginTop: 20 }}>
            <ProgressBar value={0} max={9} label="0 of 9 dishes completed" />
            <ProgressBar value={5} max={8} label="5 of 8 dishes completed" />
            <ProgressBar value={8} max={8} label="8 of 8 dishes completed" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginTop: 20 }}>
            <StatTile value={4} label="Events" />
            <StatTile value={31} label="Dishes" />
            <StatTile value={12} label="Allergens flagged" />
            <StatTile value="1/4" label="Print-ready" />
            <StatTile value={2} label="Pending review" tone="brand" />
          </div>
          <div style={{ marginTop: 20 }}>
            <FilterChipsDemo />
          </div>
          <div style={{ marginTop: 20 }}>
            <SaveStatusDemo />
          </div>
          <div style={{ marginTop: 20 }}>
            <ErrorMessageDemo />
          </div>
          <LoadingPlaceholder label="Loading today's events" style={{ marginTop: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="stat-card" style={{ display: "grid", justifyItems: "center", gap: 8 }}>
                  <Skeleton width={36} height={22} />
                  <Skeleton width="70%" height={10} />
                </div>
              ))}
            </div>
            {Array.from({ length: 2 }, (_, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 16 }}>
                <Skeleton shape="circle" width={28} />
                <div style={{ flex: 1 }}>
                  <Skeleton shape="text" lines={2} />
                </div>
                <Skeleton width={84} height={20} />
              </div>
            ))}
          </LoadingPlaceholder>
        </div>
        <div
          className="card"
          style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}
        >
          <TextField label="Your name" placeholder="e.g. Jamie Baker" />
          <TextField
            label="Event name"
            placeholder="e.g. Quarterly partner briefing"
            hint="Visible on every printed document"
          />
          <TextField label="Email" type="email" defaultValue="jamie@" error="Enter a valid email address" />
          <Select label="Room" options={ROOM_OPTIONS} defaultValue="CS 1" />
          <Select
            label="Service room"
            options={ROOM_OPTIONS}
            placeholder="Choose a room"
            hint="Printed on the allergen sheet"
          />
          <Select label="Venue" options={VENUE_OPTIONS} placeholder="Choose a venue" error="Venue is required" />
        </div>
        <div className="card" style={{ marginTop: 16 }}>
          <ul
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: 16,
              listStyle: "none",
              margin: 0,
              padding: 0,
            }}
          >
            {ALLERGENS.map(({ id }) => (
              <li key={id} style={{ display: "flex", justifyContent: "center" }}>
                <AllergenLabel allergen={id} size={40} />
              </li>
            ))}
          </ul>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 20 }}>
            <span className="field-label">Contains</span>
            <AllergenLabel allergen="gluten" layout="inline" size={20} />
            <AllergenLabel allergen="milk" layout="inline" size={20} />
            <AllergenLabel allergen="sulphites" layout="inline" size={20} />
          </div>
        </div>
      </div>
    </main>
  );
}
