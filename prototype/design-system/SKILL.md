---
name: emcc-allergen-design
description: Use this skill to generate well-branded interfaces and assets for the EMCC Allergen Manager (East Midlands Conference Centre / Nottingham Venues), either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colours, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the `README.md` file within this skill, and explore the other available files.

Key files to orient on first:

- `README.md` — full system context: product, content fundamentals, visual foundations, iconography
- `colors_and_type.css` — single source of truth for tokens (drop-in `<link>` or `@import`)
- `ui_kits/allergen-manager/` — interactive recreation; `index.html` shows it click-through; `*.jsx` files contain the components you'd lift
- `assets/` — logos, brand mark, icon set (Tabler-style outline SVGs)
- `preview/` — small card previews of each token group / component

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out of `assets/` and create static HTML files for the user to view. Import `colors_and_type.css` to get all tokens for free.

If working on production code, you can copy assets and read the rules in `README.md` to become an expert in designing with this brand. The kit-level components in `ui_kits/allergen-manager/` are cosmetic-only — re-implement against real state management when shipping.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions (audience, surface, fidelity, whether they want options), and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

Hard rules — do not violate without explicit user override:

- **Forest** (`#1D3A2F`) is the only primary action colour
- **Gold** (`#C4965A`) is reserved exclusively for the Print action
- **Red** is allergen-present or error only — never anything else
- **One primary button per screen**, never two
- **No emoji**. The only allowed character-as-icon is `✕` for "allergen present" on the matrix
- **DM Mono only for version stamps and tokens** — never body, never headings
- **No gradients**, **no glassmorphism**, **no blur**, **no scale-on-press**
- **British English** — *colour, centre, organise* — and sentence case for all labels
- **Stamp every printed document** with `vN · DD Mon · HH:MM` in DM Mono
