import type { ReactNode } from "react";

/** Colour of a chip when selected: forest by default, or a status colour. */
export type FilterChipTone = "brand" | "danger" | "warn" | "ready";

export type FilterChipOption<T extends string> = {
  value: T;
  label: string;
  count?: number;
  tone?: FilterChipTone;
};

type FilterChipsProps<T extends string> = {
  /** Accessible name for the group, e.g. "Filter events by status". */
  label: string;
  options: readonly FilterChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Right-aligned note after the chips, e.g. "Sorted by service time". */
  meta?: ReactNode;
};

/**
 * Single-choice row of filter chips with counts (`.filter-chip` in prototype.css).
 * Each chip is a toggle button; the selected one has aria-pressed="true".
 */
export function FilterChips<T extends string>({ label, options, value, onChange, meta }: FilterChipsProps<T>) {
  return (
    <div className="filter-chip-row" role="group" aria-label={label}>
      {options.map((option) => {
        const selected = option.value === value;
        const classes = [
          "filter-chip",
          option.tone && option.tone !== "brand" ? `filter-chip-${option.tone}` : null,
          selected ? "active" : null,
        ];
        return (
          <button
            key={option.value}
            type="button"
            className={classes.filter(Boolean).join(" ")}
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
          >
            {option.label}
            {/* The space keeps the accessible name "Ready 3", not "Ready3"; flex layout doesn't render it. */}
            {option.count !== undefined && <> <span className="filter-chip-count">{option.count}</span></>}
          </button>
        );
      })}
      {meta && (
        <>
          <span className="filter-chip-spacer" />
          <span className="filter-chip-meta">{meta}</span>
        </>
      )}
    </div>
  );
}
