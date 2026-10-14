/* global React, Icon, Button, Field, Input, Tag, TagToggle, Badge, Banner, Card, CardHeader, StatCard, VersionStamp, ProgressBar, AllergenCell, DocRow, TopNav, EventCard, MatrixTable */
// Screens: Dashboard, EventEntry, PrintConfirm.
// All state owned by App.jsx and threaded through props.

const ALLERGENS = ["Celery","Gluten","Crustaceans","Eggs","Fish","Lupin","Milk","Molluscs","Mustard","Nuts","Peanuts","Sesame","Soya","Sulphites"];

function Dashboard({ events, onOpen, onPrint }) {
  const ready = events.filter(e => e.status === "ready").length;
  const incomplete = events.filter(e => e.status === "incomplete").length;
  const reprint = events.filter(e => e.status === "warn").length;
  return (
    <div className="screen">
      <div className="screen-header">
        <div>
          <h1 className="screen-title">Today's events</h1>
          <div className="screen-sub">Wednesday 20 May · 4 events scheduled</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button variant="secondary" icon="filter">Filter</Button>
          <Button variant="primary" icon="plus">New event</Button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        <StatCard num={events.length} label="Events" />
        <StatCard num={ready} label="Ready" />
        <StatCard num={reprint} label="Reprint" />
        <StatCard num={incomplete} label="Incomplete" />
      </div>

      {reprint > 0 && (
        <div style={{ marginBottom: 20 }}>
          <Banner kind="warn">
            Tomato &amp; basil soup was updated at 11:42 — celery added. 1 event affected, reprint required.
          </Banner>
        </div>
      )}

      <div className="section-title">All events</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {events.map(e => (
          <EventCard
            key={e.id}
            event={e}
            onOpen={() => onOpen(e.id)}
            onPrint={() => onPrint(e.id)}
          />
        ))}
      </div>
    </div>
  );
}

function EventEntry({ event, onBack, onPrint, onUpdateDish, onSelectDish, selectedDishId, onSaveDish }) {
  const dish = event.dishes.find(d => d.id === selectedDishId) || event.dishes[0];
  const done = event.dishes.filter(d => d.complete).length;

  const toggleAllergen = (allergen) => {
    const cur = dish.allergens?.[allergen];
    const next = cur === "present" ? "may" : cur === "may" ? undefined : "present";
    onUpdateDish(dish.id, {
      allergens: { ...dish.allergens, [allergen]: next },
    });
  };

  const toggleTag = (tag) => {
    const tags = dish.tags || [];
    const next = tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag];
    onUpdateDish(dish.id, { tags: next });
  };

  const containsList = Object.entries(dish.allergens || {})
    .filter(([, v]) => v === "present")
    .map(([k]) => k);

  const mayContainList = Object.entries(dish.allergens || {})
    .filter(([, v]) => v === "may")
    .map(([k]) => k);

  return (
    <div className="screen">
      <div className="screen-header" style={{ alignItems: "flex-start" }}>
        <div>
          <button
            onClick={onBack}
            type="button"
            style={{ background: "none", border: "none", color: "var(--fg-4)", fontSize: 12, padding: 0, marginBottom: 6, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "inherit" }}
          >
            <Icon name="chevron-left" size={12} />
            Back to dashboard
          </button>
          <h1 className="screen-title">{event.name}</h1>
          <div className="screen-sub">{event.room} · {event.time} · Menu {event.menu}</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <VersionStamp>v{event.version} · 18 May · 11:42</VersionStamp>
          <Button variant="gold" icon="print" onClick={onPrint} disabled={done < event.dishes.length}>
            Print all 3 documents
          </Button>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: "var(--fg-3)" }}>
            {done} of {event.dishes.length} dishes completed
          </span>
          <span style={{ fontSize: 12, color: "var(--fg-4)" }}>
            {Math.round((done / event.dishes.length) * 100)}%
          </span>
        </div>
        <ProgressBar value={done} max={event.dishes.length} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 18 }}>
        {/* Dish list */}
        <div>
          <div className="section-title">Dishes</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, background: "var(--white)", border: "var(--border-default)", borderRadius: "var(--radius-lg)", padding: 6 }}>
            {event.dishes.map(d => (
              <button
                key={d.id}
                type="button"
                onClick={() => onSelectDish(d.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "8px 10px",
                  border: "none", background: d.id === dish.id ? "var(--brand-forest-faint)" : "transparent",
                  borderRadius: "var(--radius-md)",
                  textAlign: "left", cursor: "pointer", fontFamily: "inherit",
                  color: d.id === dish.id ? "var(--brand-forest)" : "var(--fg-2)",
                  fontWeight: d.id === dish.id ? 500 : 400,
                  fontSize: 13,
                }}
              >
                <span style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: d.complete ? "var(--color-success)" : "var(--neutral-300)",
                  flexShrink: 0,
                }}></span>
                <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.name}</span>
                {d.tags?.includes("v") && <Tag kind="v">V</Tag>}
                {d.tags?.includes("vg") && <Tag kind="vg">VG</Tag>}
              </button>
            ))}
          </div>
        </div>

        {/* Entry pane */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Card>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label="Dish name" hint="As it appears on all 3 documents">
                <Input value={dish.name} onChange={e => onUpdateDish(dish.id, { name: e.target.value })} />
              </Field>
              <Field label="Menu section" hint="Starter · Main · Side · Dessert">
                <Input value={dish.section || ""} onChange={e => onUpdateDish(dish.id, { section: e.target.value })} placeholder="Main" />
              </Field>
              <Field label="Contains" badge="auto" hint="Auto-filled from allergen ticks below">
                <Input auto readOnly value={containsList.join(", ") || "—"} />
              </Field>
              <Field label="May contain" badge="manual" hint="Cross-contamination warning">
                <Input value={mayContainList.join(", ")} readOnly placeholder="None" />
              </Field>
            </div>
          </Card>

          <Card>
            <div className="section-title" style={{ marginBottom: 14 }}>Allergens · click to toggle</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
              {ALLERGENS.map(a => (
                <AllergenCell
                  key={a}
                  name={a}
                  state={dish.allergens?.[a]}
                  onClick={() => toggleAllergen(a)}
                />
              ))}
            </div>
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: "var(--border-default)" }}>
              <div className="section-title" style={{ marginBottom: 8 }}>Dietary tags</div>
              <div style={{ display: "flex", gap: 8 }}>
                <TagToggle kind="v" active={dish.tags?.includes("v")} onClick={() => toggleTag("v")}>V</TagToggle>
                <TagToggle kind="vg" active={dish.tags?.includes("vg")} onClick={() => toggleTag("vg")}>VG</TagToggle>
                <TagToggle kind="ncgi" active={dish.tags?.includes("ncgi")} onClick={() => toggleTag("ncgi")}>NCGI</TagToggle>
              </div>
            </div>
          </Card>

          <div style={{ display: "flex", gap: 8, justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: 8 }}>
              <Button variant="ghost" onClick={onBack}>Cancel</Button>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Button variant="secondary">Save draft</Button>
              <Button variant="primary" onClick={() => onSaveDish(dish.id)}>
                {dish.complete ? "Mark in progress" : "Mark complete"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PrintConfirm({ event, onClose, onPrint, printed }) {
  return (
    <div className="modal-veil" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600, color: "var(--fg-1)", letterSpacing: "-0.2px" }}>
              {printed ? "Printed successfully" : "Print all 3 documents"}
            </div>
            <div style={{ fontSize: 12, color: "var(--fg-4)", marginTop: 4 }}>
              {event.name} · {event.room} · {event.time}
            </div>
          </div>
          <button onClick={onClose} type="button" style={{ background: "none", border: "none", color: "var(--fg-4)", cursor: "pointer", padding: 4 }}>
            <Icon name="close" size={16} />
          </button>
        </div>

        {printed && (
          <div style={{ marginBottom: 16 }}>
            <Banner kind="success">
              All 3 documents printed · v{event.version} · 18 May 11:48
            </Banner>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 18 }}>
          <DocRow title="Allergen sheet" meta={`All ${event.dishes.length} dishes · 14 allergens · v${event.version} · 18 May 11:42`} status="ready" statusLabel="Ready" />
          <DocRow title="Menu" meta={`Dish names + tags · v${event.version} · 18 May 11:42`} status="ready" statusLabel="Ready" />
          <DocRow title="Allergen matrix" meta={`Compact grid · v${event.version} · 18 May 11:42`} status="ready" statusLabel="Ready" />
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Button variant="ghost" onClick={onClose}>{printed ? "Close" : "Cancel"}</Button>
          {!printed && (
            <Button variant="gold" icon="print" onClick={onPrint}>Print all 3 documents</Button>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Dashboard, EventEntry, PrintConfirm, ALLERGENS });
