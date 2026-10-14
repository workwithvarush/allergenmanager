# EMCC Allergen Manager — Design System

A design system for the **Allergen Manager** internal tool used at the **East Midlands Conference Centre (EMCC)**, part of **Nottingham Venues**. The Allergen Manager is the single product covered here: a desktop-first web app the kitchen and FOH (front-of-house) team use to fill in allergen information per dish and generate the three printed documents that must travel with every event service — the **allergen sheet**, the **menu**, and the **allergen matrix**.

## What it's for

EMCC services dozens of events a week — conferences, summits, banquets — each with a bespoke menu of 4–12 dishes. For every event, three printed documents are required by the team and by allergen regulation:

1. **Allergen sheet** — full dish list with 14 statutory allergens ticked per dish
2. **Menu** — public-facing dish names with `(V)(VG)(NCGI)` dietary tags
3. **Allergen matrix** — compact grid (dishes × allergens) for the kitchen pass

These currently live as paper sheets re-typed by hand for every event. The Allergen Manager replaces that with one entry screen + one print action that emits all three documents from a single source of truth, with version stamps so FOH can verify which print is current.

## Sources

This system was extracted from a single reference document:

- **GitHub** — [`workwithvarush/emccdeisgnsystem`](https://github.com/workwithvarush/emccdeisgnsystem) (specifically `index.html`)

The reader is encouraged to clone or browse that repo for the original mid-fi specification — it shows the design tokens, components and printed-output conventions in their canonical form. The system here is a fuller working build of that spec: real CSS variables, JSX components, click-through screens and printable card previews.

A copy of the original spec lives at [`reference/source-spec.html`](reference/source-spec.html) for offline access.

---

## Content fundamentals

The Allergen Manager copy is **operational, calm and direct**. Staff using it are mid-service or prepping a service — they need scannable status and unambiguous actions. There is no marketing voice anywhere in the product. Specifics:

- **Voice** — third-person / system-neutral. The tool addresses *actions* and *state*, not the user. "3 dishes have not been completed" rather than "You haven't completed 3 dishes." It's a *clipboard*, not a *coach*.
- **Sentence case** — every label, button and heading is sentence case. `Fill allergens`, `Print all 3 documents`, `Reprint required`. Never title case. Never ALL CAPS except for two specific places: the `--caption` text-transform on small labels (tracked +0.05em) and the dietary tag tokens (`V`, `VG`, `NCGI`).
- **Brevity** — labels are one to three words. Buttons name the literal output: "Print all 3 documents", not "Generate".
- **British English** — *colour*, *centre*, *organise*. The venue is in Nottingham. Note also: "May contain" (regulation phrasing) is preserved verbatim.
- **No emoji**. Anywhere. Status uses coloured dot badges and tabler-style icons. The only character-as-icon is the `✕` mark used to indicate "allergen present" on the printed matrix — that is a deliberate carry-over from the existing physical paper sheet so kitchen staff recognise the convention.
- **No exclamation marks**. No "!". Errors and warnings are factual: "Event name is required" / "Reprint required."
- **Version stamps everywhere on output** — `v3 · 18 May · 11:42`. Set in DM Mono. This is the most important repeated piece of microcopy in the system: any printed document carries one so FOH can resolve "is this still the current sheet?" in under a second.
- **Allergen names** — the 14 statutory UK allergens, exact spelling: *Celery, Gluten, Crustaceans, Eggs, Fish, Lupin, Milk, Molluscs, Mustard, Nuts, Peanuts, Sesame, Soya, Sulphites*.
- **Dietary tag glossary** — `V` = Vegetarian · `VG` = Vegan · `NCGI` = Not Containing Gluten Ingredients. On printed documents tags appear in parentheses concatenated after the dish name: *Mexican rice (VG)(NCGI)*.
- **Tone in errors** — neutral, never blaming. "Event name is required" not "Please enter a name". "3 dishes have not been completed" not "You need to finish".
- **Tone in success** — confirmatory and stamped. "All 3 documents printed successfully · v3 · 18 May 11:48".

---

## Visual foundations

A serious, document-first aesthetic — closer to a payroll system or a printed-form back office than a SaaS marketing page. Confidence comes from typographic restraint and one strong brand colour, not from gradients or imagery.

### Colour

- **Forest** (`#1D3A2F`) is the single dominant brand colour. It carries: primary buttons, brand mark, active nav state, focus rings, progress fills, key headings. The full Forest scale (`forest / forest-mid / forest-light / forest-pale / forest-faint`) is used for hovers, surfaces and 8% tint accents.
- **Gold** (`#C4965A`) is reserved **exclusively for the Print action** and a sparing decorative accent (section numbers in the spec, cover meta). This is a hard rule — Gold appearing in the UI signals "you are about to commit to a printed document." Using it elsewhere weakens that signal.
- **Neutrals** are a 10-step warm-grey scale from `#F8F8F8` (50) to `#141414` (900). Backgrounds use 50/100; borders use 200/300; body type 800; secondary 500–600.
- **Semantic** colours map to four states — danger, warning, success, info — each with a foreground, a background fill (≈92% lightness) and a border. They appear on banners, badges and form errors.
- **No gradients.** The system has zero use of `linear-gradient` for backgrounds, buttons or surfaces. Hover states darken by a fixed step (forest → forest-mid). Disabled states drop opacity to 0.4.
- **No blue-purple AI palette.** Info blue (`#1A5CA8`) is used only for the `NCGI` tag and the info banner — it never becomes a primary or feature colour.

### Typography

- **DM Sans** is the only sans. Weights 400 / 500 / 600. The default body size is **13px** — this is a *dense, operational* UI, not a marketing page.
- **DM Mono** is reserved for: version stamps (`v3 · 18 May`), token names (`--brand-forest`), and field hints in `.t-label`-style metadata. It signals "this is technical / system-generated."
- Headings carry tight negative tracking (-0.2 to -0.5px). Captions and labels use positive tracking (+0.05em) and uppercase.
- Line-height defaults to 1.5 for body, 1.1–1.3 for headings.

### Spacing & rhythm

- 4px base. Every spacing value is a multiple of 4. Tokens `--space-1` through `--space-16`.
- Internal card padding is `--space-5` (20px) for default cards and `--space-4` (16px) for small cards.
- Section breathing room is `--space-8` (32px). Page-level padding is `--space-12` (48px).

### Backgrounds

- **No imagery.** No hero photos, no full-bleed product shots, no illustrations. The product is a tool, not a story. The only "imagery" is the printed-document preview thumbnail composed from icon + text rows.
- **No textures, patterns or grain.** Surfaces are pure flat fills from the neutral or forest scale.
- The app background is `--neutral-50` (`#F8F8F8`). Cards sit on it as white surfaces with `--border-default` (1px `#E0E0E0`) and `--shadow-sm`.

### Borders, radii & elevation

- Radii ladder: **4px** (allergen cells, tags) → **6px** (buttons, inputs) → **8px** (small cards, doc rows) → **12px** (cards, panels, app shell) → **pill** (tag toggles).
- Borders are 1px hairlines in `#E0E0E0`. The 2px focus ring uses Forest with a 3px `rgba(29,58,47,.1)` outer halo.
- Shadows are minimal and warm-greyscale: `sm` (default cards), `md` (dropdowns), `lg` (modals). No coloured glows. No inner shadows. No "neumorphism."

### Cards

White surface, 1px neutral-200 border, 12px radius for primary cards and 8px for small ones, 20px internal padding. They use `--shadow-sm` by default and don't lift on hover (this is a tool, not a clickable feed).

### Motion

- **Subdued.** Every transition is `100ms ease` (fast — button hover, allergen cell tick) or `150ms ease` (base — input focus, banner appear). Progress bar fill uses `300ms ease`.
- No spring, no bounce, no overshoot. No page-load animations. No skeleton shimmers. The tool feels *instant and quiet*.
- The two animated properties are `background-color` and `border-color`. We do not animate transform or scale.

### Hover & press states

- **Buttons** — primary hover darkens (forest → forest-mid). Secondary hover swaps fill from white to neutral-50 and border 300 → 400. Ghost gains a neutral-100 fill. No scale change.
- **Allergen cells** — hover lifts border to neutral-400 + neutral-50 fill. Active "present" state stays red.
- **Tag toggles** — hover darkens the border one step. Active state swaps to the tag's coloured palette (bg + text + border).
- **Nav links** — hover paints neutral-100 background; active paints `forest-faint` + forest text.
- **No press shrink**. No `:active { transform: scale(.96) }`. Press is implicit.

### Transparency & blur

- **None.** Zero use of `backdrop-filter`, `blur()`, `rgba` translucent surfaces, or glassmorphism. The only `rgba` use is in shadows and the focus-ring halo. Modals (when they appear) use a flat 50% black overlay, no blur.

### Imagery colour vibe

- N/A — the product uses no photography. If imagery is ever added (e.g. dish photos in a future Library), the brief is: **natural lighting, neutral-warm white balance, no filters, no grain, no duotone.** Plate-on-pale-linen aesthetic at most. Never warm vintage, never cool clinical.

### Layout rules

- **Fixed top nav** (52px tall) on every screen with the brand mark left, nav links right.
- **No sticky footer.** Footers when present are flat document-end markers.
- Content max-width is 960px on documentation, 1200px on app screens.
- Two-column layout for entry screens (dish list left, allergen grid right). One-column for documents and previews.

### Use of iconography

Tabler outline icons, 1.8px stroke. See ICONOGRAPHY below for the full rationale.

---

## Iconography

The system uses **Tabler Icons** in outline-only mode. They are loaded from the Tabler CDN as inline SVGs — see `assets/icons/` for the curated set used in this kit.

Rules:

- **Outline only** — never filled variants. Outline matches the hairline border aesthetic of the rest of the UI.
- **Stroke width 1.8px** consistently. No variable stroke. Round line-caps, round line-joins.
- **Sizes** — 16px inline (next to label in buttons or list rows), 18px in button leading slots, 20px decorative / standalone (icon-only ghost buttons in toolbars).
- **Always paired with text** for primary or destructive actions. Icon-only is allowed for utility (close `×`, sort `⇅`, drag-handle) but never for "Print" or "Delete event".
- **Colour follows context** — icons inherit the colour of their text. Danger icons use `--color-danger`, success uses `--color-success`. Default icon colour is `currentColor` resolving to whatever wraps it.

**No emoji** appears anywhere in the product, ever. The two non-icon glyphs used are:

- `✕` — used as the "allergen present" mark inside the matrix cells, deliberately matching the existing paper-sheet convention. Set in DM Sans semibold, red.
- `·` (middle dot) — used as a separator in meta lines (`Room 4 · 12:30 · Menu A`). Never use commas, slashes or pipes for this.

Logos and brand mark live in `assets/logo/`. The brand mark is a simple Forest-coloured pin icon with the wordmark **Allergen manager** beside it — see `assets/logo/wordmark.svg`. There is no separate "EMCC" logomark in this kit; the venue branding is implied by the colour palette and footer credit.

---

## Index — what's in this folder

Root files:

- **`README.md`** — this document
- **`SKILL.md`** — Agent-skill manifest (cross-compatible with Claude Code skill format)
- **`colors_and_type.css`** — single source of truth for CSS custom properties (colours, type scale, spacing, radii, shadows, transitions, semantic aliases)
- **`Allergen Manager Prototype.html`** — live, clickable hi-fi prototype (Dashboard → Entry → Preview & print) with Tweaks panel
- **`Allergen Manager Variants.html`** — side-by-side static design variants on a pan/zoom canvas, covering three open decisions: event list density, allergen sheet format, new-event creation flow

Folders:

- **`reference/`** — the original mid-fi spec (`source-spec.html`) lifted from the GitHub repo
- **`assets/`** — logo, brand mark, icon set
  - `logo/wordmark.svg` — Allergen manager wordmark
  - `logo/mark.svg` — pin-only brand mark
  - `icons/` — Tabler-style outline SVGs (dashboard, edit, print, search, warning, check, chevron, plus, settings, close, sort, drag, calendar, clock, filter, document)
- **`preview/`** — small card previews registered into the Design System tab (colours, type, spacing, components, etc.)
- **`ui_kits/allergen-manager/`** — the one product UI kit
  - `index.html` — interactive click-through demo (dashboard → event entry → print confirm)
  - `README.md` — what's in the kit, how to use it
  - `*.jsx` — React components: `TopNav`, `Button`, `Field`, `Tag`, `AllergenCell`, `Badge`, `Banner`, `Card`, `StatCard`, `EventCard`, `MatrixTable`, `DocRow`, `VersionStamp`, etc.

There is **one product** in this design system — Allergen Manager. No marketing site, no mobile app, no docs site exist. If/when those are commissioned, they should extend (not fork) this token set.

---

## Caveats

- **DM Sans + DM Mono load from Google Fonts CDN.** No local `.ttf` is bundled. If offline use is required, download both families from [https://fonts.google.com/specimen/DM+Sans](https://fonts.google.com/specimen/DM+Sans) and [https://fonts.google.com/specimen/DM+Mono](https://fonts.google.com/specimen/DM+Mono) into `fonts/` and rewrite the `@import` at the top of `colors_and_type.css` to local `@font-face` rules.
- **Tabler icons** are reproduced as hand-rolled outline SVGs in `assets/icons/`. The shapes match the Tabler convention (1.8px stroke, round caps, 24px viewBox) but are not lifted directly from the Tabler package. For production usage, install `@tabler/icons-react` and substitute.
- **No EMCC / Nottingham Venues logomark** was provided in the source repo — the brand identity is communicated through palette, typography and the "Allergen manager" wordmark only. If a real venue mark exists, drop it into `assets/logo/` and reference it from the top nav.
