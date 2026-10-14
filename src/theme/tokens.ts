/**
 * EMCC Allergen Manager — colour and typography tokens.
 *
 * Single source of truth. Every key is emitted as a CSS custom property of
 * the same name (`"brand-forest"` → `--brand-forest`) by <ThemeStyle />, so
 * the design-system stylesheets in src/styles/design-system keep working
 * unchanged. Spacing, radii, borders, shadows and motion still live in
 * src/styles/design-system/colors_and_type.css.
 *
 * Values may reference other tokens with `ref()`; use `resolveToken()` when
 * you need the final literal (e.g. for <meta theme-color> or PDF output).
 */

/** A `var(--name)` reference to another token. */
const ref = (name: string) => `var(--${name})`;

/** Mix a token with transparency; follows the token when a theme overrides it. */
const alpha = (name: string, percent: number) =>
  `color-mix(in srgb, ${ref(name)} ${percent}%, transparent)`;

export const colorTokens = {
  // ── Brand: Forest (primary) ──────────────────────────
  "brand-forest": "#1D3A2F",
  "brand-forest-mid": "#2A5240",
  "brand-forest-light": "#3B6B54",
  "brand-forest-pale": "#EAF2EE",
  "brand-forest-faint": "#F4F8F6",
  "brand-forest-alpha-6": alpha("brand-forest", 6),
  "brand-forest-alpha-8": alpha("brand-forest", 8),
  "brand-forest-alpha-10": alpha("brand-forest", 10),
  "brand-forest-border": `color-mix(in srgb, ${ref("brand-forest")} 30%, ${ref("white")})`, // badge outline

  // ── Brand: Gold (reserved for the Print action) ──────
  "brand-gold": "#C4965A",
  "brand-gold-mid": "#D4A96E",
  "brand-gold-light": "#EDD5AD",
  "brand-gold-pale": "#FAF3E8",

  // ── Neutral scale ────────────────────────────────────
  "neutral-900": "#141414",
  "neutral-800": "#252525",
  "neutral-700": "#3D3D3D",
  "neutral-600": "#555555",
  "neutral-500": "#777777",
  "neutral-400": "#999999",
  "neutral-300": "#C4C4C4",
  "neutral-200": "#E0E0E0",
  "neutral-100": "#F0F0F0",
  "neutral-50": "#F8F8F8",
  white: "#FFFFFF",

  // ── Semantic ─────────────────────────────────────────
  "color-danger": "#C0392B",
  "color-danger-hover": "#A93226",
  "color-danger-bg": "#FDECEA",
  "color-danger-border": "#F4B8B3",
  "color-warning": "#B7791A",
  "color-warning-bg": "#FEF6E7",
  "color-warning-border": "#F5D08A",
  "color-success": "#2D7D46",
  "color-success-bg": "#EAF5EE",
  "color-success-border": "#A3D4B2",
  "color-info": "#1A5CA8",
  "color-info-bg": "#E8F0FB",
  "color-info-border": "#A8C4EF",

  // ── Allergen status ──────────────────────────────────
  "allergen-present": "#C0392B",
  "allergen-present-bg": "#FDECEA",
  "allergen-maycontain": "#B7791A",
  "allergen-maycontain-bg": "#FEF6E7",
  "allergen-absent": "#E0E0E0",
  "allergen-absent-bg": "#F8F8F8",

  // ── Dietary tags ─────────────────────────────────────
  "tag-v-text": "#2D5A1E",
  "tag-v-bg": "#EAF4E2",
  "tag-v-border": "#A8D48A",
  "tag-vg-text": "#1D5C3A",
  "tag-vg-bg": "#E4F2EC",
  "tag-vg-border": "#8FD0AE",
  "tag-ncgi-text": "#1A5CA8",
  "tag-ncgi-bg": "#E8F0FB",
  "tag-ncgi-border": "#A8C4EF",
  "tag-df-text": "#6E3FA3",
  "tag-df-bg": "#F1E9F8",
  "tag-df-border": "#CDB2E6",

  // ── Foreground aliases ───────────────────────────────
  "fg-1": ref("neutral-900"), // headings
  "fg-2": ref("neutral-800"), // body
  "fg-3": ref("neutral-600"), // secondary text
  "fg-4": ref("neutral-500"), // tertiary / hints
  "fg-5": ref("neutral-400"), // placeholders / caps
  "fg-brand": ref("brand-forest"),
  "fg-onbrand": ref("white"),

  // ── Background aliases ───────────────────────────────
  "bg-app": ref("neutral-50"),
  "bg-card": ref("white"),
  "bg-sunken": ref("neutral-100"),
  "bg-brand": ref("brand-forest"),
  "bg-brand-soft": ref("brand-forest-pale"),
  "bg-onbrand-subtle": "rgba(255, 255, 255, 0.18)", // chips sitting on a brand fill
  "bg-overlay": "rgba(20, 20, 20, 0.5)", // modal veil
} as const;

export const typographyTokens = {
  // Families — --font-dm-sans / --font-dm-mono come from next/font in app/layout.tsx.
  "font-sans": `${ref("font-dm-sans")}, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`,
  "font-mono": `${ref("font-dm-mono")}, ui-monospace, SFMono-Regular, Menlo, monospace`,

  // Scale (compact, info-dense UI)
  "text-xs": "11px",
  "text-sm": "12px",
  "text-base": "13px", // default body
  "text-md": "14px",
  "text-lg": "16px",
  "text-xl": "20px",
  "text-2xl": "24px",
  "text-3xl": "30px",

  // Weights
  "fw-regular": "400",
  "fw-medium": "500",
  "fw-semibold": "600",
} as const;

export const tokens = { ...colorTokens, ...typographyTokens } as const;

export type ColorToken = keyof typeof colorTokens;
export type TypographyToken = keyof typeof typographyTokens;
export type Token = keyof typeof tokens;

/**
 * Alternate brand themes, applied with `<html data-theme="…">`.
 * Each overrides only the tokens it changes; aliases and alpha tokens follow.
 */
export const themes = {
  "forest-dark": {
    "brand-forest": "#14241D",
    "brand-forest-mid": "#1F3C2F",
    "brand-forest-light": "#2A5240",
    "brand-forest-faint": "#F1F5F2",
  },
  "forest-warm": {
    "brand-forest": "#2D4A35",
    "brand-forest-mid": "#3D6047",
    "brand-forest-light": "#517D5E",
    "brand-gold": "#B07A3E",
    "brand-gold-mid": "#C99057",
  },
} as const satisfies Record<string, Partial<Record<ColorToken, string>>>;

export type ThemeName = "default" | keyof typeof themes;

/** `cssVar("brand-forest")` → `"var(--brand-forest)"`, for inline styles. */
export function cssVar(name: Token): string {
  return ref(name);
}

/**
 * The literal value of a token, following `var()` aliases (e.g. `fg-1` →
 * `#141414`). Values built with color-mix or next/font variables are
 * returned as written, since only the browser can resolve them.
 */
export function resolveToken(name: Token, theme: ThemeName = "default"): string {
  const overrides: Partial<Record<Token, string>> =
    theme === "default" ? {} : themes[theme];
  let value: string = overrides[name] ?? tokens[name];
  for (let match; (match = /^var\(--([\w-]+)\)$/.exec(value)); ) {
    const next = match[1] as Token;
    if (!(next in tokens)) break;
    value = overrides[next] ?? tokens[next];
  }
  return value;
}
