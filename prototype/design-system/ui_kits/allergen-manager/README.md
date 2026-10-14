# Allergen Manager — UI kit

A click-through, hi-fi recreation of the EMCC Allergen Manager. One product, three screens, real interactivity at the cosmetic level.

## How to use

Open `index.html`. The app boots into the **Dashboard** with four seeded events. From there:

1. **Dashboard** — overview of today's events. Each card shows progress, status badge (Ready / Reprint required / Incomplete) and per-event actions. Stat row shows totals.
2. **Event entry** — click "Fill allergens" on a card. The split-pane entry screen shows the dish list left, the entry pane right. Click an allergen cell to cycle through `absent → present → may → absent`. Click a dietary tag toggle to add/remove tags. Click "Mark complete" to advance.
3. **Print confirm** — click "Print all 3" (gold). The modal lists the three documents that will be generated and confirms with a stamped success banner after printing.

Navigation between screens uses the in-app top nav and "Back to dashboard" link. State is held in `App.jsx` — no router, no persistence (refresh resets to seed data).

## Files

- **`index.html`** — boots React, Babel, and the JSX modules
- **`kit.css`** — full kit styles; imports tokens from `../../colors_and_type.css`
- **`Icons.jsx`** — `<Icon name="…" size={…} />` — Tabler-style outline icons
- **`Components.jsx`** — atoms: `Button`, `Field`, `Input`, `Tag`, `TagToggle`, `Badge`, `Banner`, `Card`, `CardHeader`, `StatCard`, `VersionStamp`, `ProgressBar`, `AllergenCell`, `DocRow`
- **`Composites.jsx`** — `TopNav`, `EventCard`, `MatrixTable`
- **`Screens.jsx`** — `Dashboard`, `EventEntry`, `PrintConfirm`
- **`App.jsx`** — state machine + seed data

## Components covered

| Atom | Variants |
|---|---|
| Button | primary / secondary / ghost / danger / gold · sm / md / lg / disabled · leading icon |
| Input | default / focused / error / auto-filled |
| Field | label + hint + error + auto/manual badge |
| Tag | V / VG / NCGI (display) |
| TagToggle | V / VG / NCGI (interactive) |
| Badge | ready / warn / danger / neutral · with/without dot |
| Banner | warn / danger / success / info |
| AllergenCell | absent / present (✕) / may contain |
| Card | default / small · with CardHeader |
| StatCard | numeric value + caption |
| VersionStamp | DM Mono pill |
| ProgressBar | partial / complete (auto green at 100%) |
| DocRow | document type + meta + status badge + preview action |

Composites: `TopNav` (52px shell), `EventCard` (dashboard cell with progress + actions), `MatrixTable` (the printed dish × allergen grid).

## What's intentionally out of scope

- **No real auth** — the top nav is a static shell.
- **No persistence** — state lives in React; refresh resets seed data.
- **Dish library** and **Settings** nav links are clickable but route nowhere (they reset to the dashboard).
- **Print** is simulated as a modal confirmation — there's no actual PDF generation here.
- **Filter** and **New event** buttons are placeholders for UI completeness.

This kit is a **visual + interaction reference** for designers and engineers building production screens against this system. Lift the components, lift the tokens, swap in real wiring.
