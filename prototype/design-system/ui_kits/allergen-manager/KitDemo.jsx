/* global React, ReactDOM, TopNav, Dashboard, EventEntry, PrintConfirm, ALLERGENS */
// Top-level state machine: dashboard ↔ entry ↔ print confirm.

const SEED_EVENTS = [
  {
    id: "e1",
    name: "Nottingham Tech Summit",
    room: "Room 4",
    time: "12:30",
    menu: "A",
    status: "incomplete",
    version: 3,
    dishes: [
      { id: "d1", name: "Chicken skewers", section: "Main", complete: true, allergens: { Milk: "present" }, tags: ["ncgi"] },
      { id: "d2", name: "Mexican rice", section: "Side", complete: true, allergens: { Sulphites: "present" }, tags: ["vg", "ncgi"] },
      { id: "d3", name: "Tomato & basil soup", section: "Starter", complete: true, allergens: { Celery: "present" }, tags: ["v", "vg"] },
      { id: "d4", name: "Beef wellington", section: "Main", complete: false, allergens: {}, tags: [] },
      { id: "d5", name: "Caesar salad", section: "Starter", complete: false, allergens: {}, tags: [] },
      { id: "d6", name: "Lemon tart", section: "Dessert", complete: false, allergens: {}, tags: [] },
      { id: "d7", name: "Fresh fruit plate", section: "Dessert", complete: true, allergens: {}, tags: ["v", "vg", "ncgi"] },
      { id: "d8", name: "Sourdough rolls", section: "Side", complete: true, allergens: { Gluten: "present", Milk: "may" }, tags: ["v"] },
    ],
  },
  {
    id: "e2",
    name: "Midlands Insurance AGM",
    room: "Suite 1",
    time: "13:00",
    menu: "B",
    status: "ready",
    version: 2,
    dishes: [
      { id: "d1", name: "Smoked salmon blini", section: "Starter", complete: true, allergens: { Fish: "present", Milk: "present", Gluten: "present" }, tags: [] },
      { id: "d2", name: "Roasted vegetable tart", section: "Main", complete: true, allergens: { Gluten: "present", Milk: "present", Eggs: "present" }, tags: ["v"] },
      { id: "d3", name: "Seasonal sorbet", section: "Dessert", complete: true, allergens: { Sulphites: "present" }, tags: ["v", "vg", "ncgi"] },
      { id: "d4", name: "Cheese selection", section: "Dessert", complete: true, allergens: { Milk: "present" }, tags: ["v"] },
    ],
  },
  {
    id: "e3",
    name: "East Midlands Schools Awards",
    room: "Banqueting Hall",
    time: "18:30",
    menu: "C",
    status: "warn",
    version: 7,
    dishes: [
      { id: "d1", name: "Pea & mint soup", section: "Starter", complete: true, allergens: { Milk: "present", Celery: "present" }, tags: ["v"] },
      { id: "d2", name: "Pan-fried sea bass", section: "Main", complete: true, allergens: { Fish: "present", Milk: "present" }, tags: ["ncgi"] },
      { id: "d3", name: "Wild mushroom risotto", section: "Main", complete: true, allergens: { Milk: "present", Sulphites: "may" }, tags: ["v", "vg"] },
      { id: "d4", name: "Chocolate fondant", section: "Dessert", complete: true, allergens: { Gluten: "present", Eggs: "present", Milk: "present", Soya: "may" }, tags: ["v"] },
      { id: "d5", name: "Petit fours", section: "Dessert", complete: true, allergens: { Gluten: "present", Eggs: "present", Milk: "present", Nuts: "may" }, tags: [] },
    ],
  },
  {
    id: "e4",
    name: "Boots HQ training day",
    room: "Room 2",
    time: "10:00",
    menu: "A",
    status: "incomplete",
    version: 1,
    dishes: [
      { id: "d1", name: "Breakfast pastries", section: "AM", complete: true, allergens: { Gluten: "present", Eggs: "present", Milk: "present" }, tags: ["v"] },
      { id: "d2", name: "Fruit & yoghurt pots", section: "AM", complete: true, allergens: { Milk: "present" }, tags: ["v", "ncgi"] },
      { id: "d3", name: "Sandwich platter", section: "Lunch", complete: false, allergens: {}, tags: [] },
      { id: "d4", name: "Crisps & dips", section: "Lunch", complete: false, allergens: {}, tags: [] },
      { id: "d5", name: "Mini desserts", section: "PM", complete: false, allergens: {}, tags: [] },
    ],
  },
];

// Derived helpers
function deriveStatus(event) {
  const allComplete = event.dishes.every(d => d.complete);
  if (!allComplete) return "incomplete";
  return event.status === "warn" ? "warn" : "ready";
}

function KitDemoApp() {
  const [events, setEvents] = React.useState(SEED_EVENTS);
  const [view, setView] = React.useState({ name: "dashboard" });
  const [selectedDishId, setSelectedDishId] = React.useState(null);
  const [navTab, setNavTab] = React.useState("dashboard");

  const currentEvent = view.eventId ? events.find(e => e.id === view.eventId) : null;

  const dishesComplete = (ev) => ev.dishes.filter(d => d.complete).length;

  // Annotate computed counts
  const annotatedEvents = events.map(e => ({
    ...e,
    dishesDone: dishesComplete(e),
    dishesTotal: e.dishes.length,
    status: deriveStatus(e),
  }));

  const openEvent = (id) => {
    const ev = events.find(e => e.id === id);
    setSelectedDishId(ev.dishes.find(d => !d.complete)?.id || ev.dishes[0].id);
    setView({ name: "entry", eventId: id });
  };

  const openPrint = (id) => {
    setView({ name: "print", eventId: id, printed: false });
  };

  const confirmPrint = () => {
    setView(v => ({ ...v, printed: true }));
  };

  const updateDish = (dishId, patch) => {
    setEvents(es => es.map(e => e.id !== view.eventId ? e : ({
      ...e,
      dishes: e.dishes.map(d => d.id === dishId ? { ...d, ...patch } : d),
    })));
  };

  const saveDish = (dishId) => {
    setEvents(es => es.map(e => e.id !== view.eventId ? e : ({
      ...e,
      dishes: e.dishes.map(d => d.id === dishId ? { ...d, complete: !d.complete } : d),
    })));
    // Advance to next incomplete dish if any
    const ev = events.find(e => e.id === view.eventId);
    const next = ev.dishes.find(d => !d.complete && d.id !== dishId);
    if (next) setSelectedDishId(next.id);
  };

  const eventAnnotated = currentEvent && annotatedEvents.find(e => e.id === currentEvent.id);

  return (
    <div className="app-shell">
      <div className="app-frame">
        <TopNav active={navTab} onNav={(tab) => {
          setNavTab(tab);
          if (tab === "dashboard") setView({ name: "dashboard" });
        }} />
        {view.name === "dashboard" && (
          <Dashboard
            events={annotatedEvents}
            onOpen={openEvent}
            onPrint={openPrint}
          />
        )}
        {view.name === "entry" && eventAnnotated && (
          <EventEntry
            event={eventAnnotated}
            selectedDishId={selectedDishId}
            onSelectDish={setSelectedDishId}
            onBack={() => setView({ name: "dashboard" })}
            onPrint={() => openPrint(eventAnnotated.id)}
            onUpdateDish={updateDish}
            onSaveDish={saveDish}
          />
        )}
        {view.name === "print" && eventAnnotated && (
          <PrintConfirm
            event={eventAnnotated}
            printed={view.printed}
            onClose={() => setView({ name: "dashboard" })}
            onPrint={confirmPrint}
          />
        )}
      </div>
      <div style={{ textAlign: "center", padding: "16px 0 0", fontSize: 11, color: "var(--fg-4)", fontFamily: "var(--font-mono)" }}>
        Nottingham Venues · Allergen Manager · UI kit demo
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<KitDemoApp />);
