import { AllergenIcon } from "@/components/AllergenIcon";
import { NottinghamVenuesLogo } from "@/components/NottinghamVenuesLogo";
import { ALLERGENS } from "@/lib/allergens";

export default function Home() {
  return (
    <main className="app-shell">
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
          <p style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <span className="badge badge-ready">Ready</span>
            <span className="badge badge-warn">Reprint required</span>
            <span className="badge badge-danger">Incomplete</span>
          </p>
          <p style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button className="btn btn-primary">Fill allergens</button>
            <button className="btn btn-secondary">Back to dashboard</button>
            <button className="btn btn-gold">Print all 3 documents</button>
          </p>
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
            {ALLERGENS.map(({ id, label }) => (
              <li
                key={id}
                className="t-small"
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}
              >
                <AllergenIcon allergen={id} size={40} alt="" />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
