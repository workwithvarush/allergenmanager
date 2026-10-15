"use client";

import { useId } from "react";
import { DIETARY_TAGS, tagConflict, venueTags } from "@/lib/dietary-tags";
import type { DietaryTag, Dish } from "@/lib/events";
import type { VenueId } from "@/lib/venues";
import styles from "./EventEntry.module.css";

type DietaryTagsProps = {
  venueId: VenueId;
  dish: Pick<Dish, "tags" | "allergens" | "notes">;
  /** e.g. "Dish 2" or the dish's name, for screen readers. */
  dishLabel: string;
  onToggle: (tag: DietaryTag) => void;
};

/**
 * The venue's dietary tag toggles for one dish, as in the prototype. A tag
 * that contradicts a "contains" allergen can't be added; if it was already on,
 * it is shown in amber and can still be removed.
 */
export function DietaryTags({ venueId, dish, dishLabel, onToggle }: DietaryTagsProps) {
  const id = useId();

  return (
    <div role="group" aria-label={`${dishLabel} dietary tags`} className={styles.tags}>
      {venueTags(venueId).map((tag) => {
        const { label, name } = DIETARY_TAGS[tag];
        const active = dish.tags.includes(tag);
        const conflict = tagConflict(tag, dish);
        const blocked = !active && conflict !== null;
        const reasonId = `${id}-${tag}`;
        return (
          <button
            key={tag}
            type="button"
            className={[styles.tag, active && styles.tagOn, active && conflict && styles.tagConflict]
              .filter(Boolean)
              .join(" ")}
            aria-label={`${label} – ${name}`}
            aria-pressed={active}
            // Kept focusable (not `disabled`) so screen readers can still find out why it's blocked.
            aria-disabled={blocked || undefined}
            aria-describedby={conflict ? reasonId : undefined}
            title={blocked ? `${name} can't be added: ${conflict}` : name}
            onClick={() => !blocked && onToggle(tag)}
          >
            {label}
            {conflict && (
              <span id={reasonId} className="sr-only">
                {blocked ? `Can't be added: ${conflict}.` : `Conflicts: ${conflict}.`}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/** Warnings for tags left on that now contradict the dish's allergens. */
export function TagConflicts({ venueId, dish }: Pick<DietaryTagsProps, "venueId" | "dish">) {
  const conflicts = venueTags(venueId)
    .filter((tag) => dish.tags.includes(tag))
    .map((tag) => ({ tag, conflict: tagConflict(tag, dish) }))
    .filter((c) => c.conflict !== null);
  if (conflicts.length === 0) return null;
  return (
    <ul className={styles.tagWarnings}>
      {conflicts.map(({ tag, conflict }) => (
        <li key={tag}>
          {DIETARY_TAGS[tag].label} ({DIETARY_TAGS[tag].name}) is ticked, but {conflict}.
        </li>
      ))}
    </ul>
  );
}
