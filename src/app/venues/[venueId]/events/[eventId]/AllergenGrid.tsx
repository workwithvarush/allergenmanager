"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { ALLERGENS, type AllergenId } from "@/lib/allergens";
import type { AllergenMark, Dish } from "@/lib/events";
import styles from "./EventEntry.module.css";

const MARK_TEXT: Record<AllergenMark | "none", string> = {
  present: "contains",
  may: "may contain",
  none: "not present",
};

/** The printed sheet marks "contains" with X and "may contain" with M; the grid does the same. */
const MARK_SYMBOL: Record<AllergenMark, string> = { present: "✕", may: "M" };

type AllergenGridProps = {
  dish: Pick<Dish, "id" | "allergens" | "notes">;
  /** e.g. "Dish 2" or the dish's name, for screen readers. */
  dishLabel: string;
  onCycle: (allergen: AllergenId) => void;
  /** Opens the note editor for an allergen. */
  onEditNote: (allergen: AllergenId) => void;
  /** Mark this grid (and its first pencil) for the guided tour — the first dish's. */
  tour?: boolean;
};

/** Selector for one cell, so focus can be returned to it (e.g. after the note editor closes). */
export function cellSelector(dishId: string, allergen: AllergenId): string {
  return `[data-cell="${dishId}:${allergen}"]`;
}

/**
 * The 14 allergens for one dish (`.allergen-cell` in kit.css). Clicking a cell
 * cycles none → contains → may contain → none; the pencil (or N on a focused
 * cell) adds an ingredient note. The grid is one Tab stop; arrow keys move
 * between cells, Space or Enter cycles.
 */
export function AllergenGrid({ dish, dishLabel, onCycle, onEditNote, tour = false }: AllergenGridProps) {
  const [active, setActive] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const gridRef = useRef<HTMLDivElement>(null);

  const cycle = (index: number) => {
    const { id, label } = ALLERGENS[index];
    const current = dish.allergens[id] ?? "none";
    const next = current === "none" ? "present" : current === "present" ? "may" : "none";
    setAnnouncement(`${label}: ${MARK_TEXT[next]}`);
    onCycle(id);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const grid = gridRef.current;
    if (!grid) return;
    if (e.key === "n" || e.key === "N") {
      e.preventDefault();
      onEditNote(ALLERGENS[active].id);
      return;
    }
    // Rows wrap differently on narrow screens, so read the column count from the layout.
    const columns = getComputedStyle(grid).gridTemplateColumns.split(" ").length;
    const moves: Record<string, number> = {
      ArrowLeft: active - 1,
      ArrowRight: active + 1,
      ArrowUp: active - columns,
      ArrowDown: active + columns,
      Home: 0,
      End: ALLERGENS.length - 1,
    };
    const next = moves[e.key];
    if (next === undefined || next < 0 || next >= ALLERGENS.length) return;
    e.preventDefault();
    setActive(next);
    grid.querySelectorAll<HTMLButtonElement>("[data-cell]")[next]?.focus();
  };

  return (
    <>
      <div ref={gridRef} role="group" aria-label={`${dishLabel} allergens`} className={styles.grid} onKeyDown={onKeyDown} data-tour={tour ? "allergen-grid" : undefined}>
        {ALLERGENS.map(({ id, label }, i) => {
          const mark = dish.allergens[id];
          const note = dish.notes[id];
          return (
            <div key={id} className={styles.cellWrap}>
              <button
                type="button"
                className={`allergen-cell ${mark ?? ""} ${styles.cell} ${note ? styles.noted : ""}`}
                data-cell={`${dish.id}:${id}`}
                tabIndex={i === active ? 0 : -1}
                aria-label={`${label}: ${MARK_TEXT[mark ?? "none"]}${note ? `, note: ${note}` : ""}`}
                aria-keyshortcuts="N"
                onFocus={() => setActive(i)}
                onClick={() => cycle(i)}
              >
                {label}
                {mark && (
                  <span className={styles.mark} aria-hidden="true">
                    {MARK_SYMBOL[mark]}
                  </span>
                )}
                {note && (
                  <span className={styles.noteChip} aria-hidden="true">
                    {note}
                  </span>
                )}
              </button>
              {/* Out of the Tab order (N on the cell does the same); still reachable by screen readers and mouse. */}
              <button
                type="button"
                className={`${styles.pencil} ${note ? styles.pencilNoted : ""}`}
                data-tour={tour && i === 0 ? "cell-note" : undefined}
                tabIndex={-1}
                aria-label={`${note ? "Edit" : "Add"} ${label} note`}
                title={note ? `${label} note: ${note}` : `Add an ingredient note to ${label}`}
                onClick={() => onEditNote(id)}
              >
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 20h4l10-10a2.8 2.8 0 0 0-4-4L4 16z" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
      <span className="sr-only" role="status">
        {announcement}
      </span>
    </>
  );
}
