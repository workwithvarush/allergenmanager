export default function Home() {
  return (
    <main className="app-shell">
      <div className="screen">
        <div className="screen-header">
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
      </div>
    </main>
  );
}
