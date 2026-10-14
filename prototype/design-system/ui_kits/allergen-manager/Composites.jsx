/* global React, Icon, Button, Badge, Card, CardHeader, StatCard, ProgressBar, Tag */
// Composite components — top nav, event card, matrix table.

function TopNav({ active, onNav }) {
  const links = [
    { id: "dashboard", label: "Dashboard" },
    { id: "library", label: "Dish library" },
    { id: "settings", label: "Settings" },
  ];
  return (
    <header className="topnav">
      <div className="topnav-brand">
        <Icon name="pin" size={18} />
        Allergen manager
      </div>
      <nav className="topnav-links">
        {links.map(l => (
          <button
            key={l.id}
            type="button"
            className={`nav-link${active === l.id ? " active" : ""}`}
            onClick={() => onNav?.(l.id)}
          >
            {l.label}
          </button>
        ))}
      </nav>
    </header>
  );
}

function EventCard({ event, onOpen, onPrint }) {
  const { name, room, time, menu, dishesDone, dishesTotal, status, version } = event;
  const ready = status === "ready";
  return (
    <Card>
      <CardHeader
        title={name}
        sub={`${room} · ${time} · Menu ${menu}`}
        right={
          ready
            ? <Badge kind="ready" dot>Ready</Badge>
            : status === "warn"
              ? <Badge kind="warn" dot>Reprint required</Badge>
              : <Badge kind="danger" dot>Incomplete</Badge>
        }
      />
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: "var(--fg-3)" }}>
              {dishesDone} of {dishesTotal} dishes completed
            </span>
            <span style={{ fontSize: 12, color: "var(--fg-4)" }}>
              {Math.round((dishesDone / dishesTotal) * 100)}%
            </span>
          </div>
          <ProgressBar value={dishesDone} max={dishesTotal} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="primary" size="sm" onClick={onOpen}>
              {ready ? "Review" : "Fill allergens"}
            </Button>
            <Button variant="gold" size="sm" icon="print" onClick={onPrint} disabled={!ready && status !== "warn"}>
              Print all 3
            </Button>
          </div>
          {version && (
            <span className="version-stamp">{version}</span>
          )}
        </div>
      </div>
    </Card>
  );
}

function MatrixTable({ dishes, allergens }) {
  return (
    <div style={{ overflowX: "auto", border: "1px solid var(--neutral-200)", borderRadius: "var(--radius-lg)", padding: 12, background: "var(--white)" }}>
      <table className="matrix">
        <thead>
          <tr>
            <th className="dish-col">Dish</th>
            {allergens.map(a => <th key={a}>{a}</th>)}
            <th className="tags-col">Tags</th>
          </tr>
        </thead>
        <tbody>
          {dishes.map(d => (
            <tr key={d.name}>
              <td className="dish-cell">{d.name}</td>
              {allergens.map(a => {
                const v = d.allergens?.[a];
                return v === "present"
                  ? <td key={a} className="x-mark">✕</td>
                  : v === "may"
                    ? <td key={a} style={{ background: "var(--allergen-maycontain-bg)", color: "var(--allergen-maycontain)", fontSize: 9 }}>may</td>
                    : <td key={a}></td>;
              })}
              <td className="tags-cell">
                {d.tags?.length
                  ? <span style={{
                      color: d.tags.includes("ncgi") ? "var(--tag-ncgi-text)"
                          : d.tags.includes("vg") ? "var(--tag-vg-text)"
                          : "var(--tag-v-text)"
                    }}>
                      {d.tags.map(t => `(${t.toUpperCase()})`).join("")}
                    </span>
                  : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

Object.assign(window, { TopNav, EventCard, MatrixTable });
