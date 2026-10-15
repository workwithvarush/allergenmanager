"use client";

import { Button } from "@/components/Button";
import { Dialog } from "@/components/Dialog";
import { ALLERGENS } from "@/lib/allergens";
import { DIETARY_TAGS } from "@/lib/dietary-tags";
import type { Dish } from "@/lib/events";

type RemoveDishDialogProps = {
  dish: Dish;
  /** e.g. "Dish 3", used when the dish has no name. */
  fallbackName: string;
  /** When the event was last printed ("HH:mm"), or null if never. */
  lastPrintedAt: string | null;
  onCancel: () => void;
  onConfirm: () => void;
};

/**
 * Asks before a dish is removed, saying what is lost: its allergen marks,
 * tags and notes, and — for a printed event — that the sheets need a reprint.
 * The safe choice ("Keep dish") has focus, so Enter or a double-click can't remove by accident.
 */
export function RemoveDishDialog({ dish, fallbackName, lastPrintedAt, onCancel, onConfirm }: RemoveDishDialogProps) {
  const name = dish.name.trim() || fallbackName;
  const marked = (mark: "present" | "may") =>
    ALLERGENS.filter((a) => dish.allergens[a.id] === mark).map((a) => a.label);
  const contains = marked("present");
  const may = marked("may");
  const notes = ALLERGENS.filter((a) => dish.notes[a.id]).map((a) => `${a.label} (${dish.notes[a.id]})`);
  const lost = [
    contains.length > 0 && `contains ${contains.join(", ")}`,
    may.length > 0 && `may contain ${may.join(", ")}`,
    dish.tags.length > 0 && `tags ${dish.tags.map((t) => DIETARY_TAGS[t].label).join(", ")}`,
    notes.length > 0 && `${notes.length === 1 ? "note" : "notes"} ${notes.join(", ")}`,
  ].filter(Boolean);

  return (
    <Dialog
      open
      onClose={onCancel}
      size="xs"
      title={`Remove ${name}?`}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} data-autofocus>
            Keep dish
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Remove dish
          </Button>
        </>
      }
    >
      <p className="t-body" style={{ margin: 0, color: "var(--fg-3)", lineHeight: 1.55 }}>
        {name} will be removed from this event&apos;s dish list
        {dish.complete ? ", although it is marked complete" : ""}.
      </p>
      {lost.length > 0 && (
        <div className="banner banner-warn">
          <div className="banner-body">Its allergen entry will be lost: {lost.join("; ")}.</div>
        </div>
      )}
      {lastPrintedAt && (
        <div className="banner banner-warn">
          <div className="banner-body">
            This event was printed at {lastPrintedAt}. Removing the dish puts the printed sheets out of date, so
            they will need a reprint.
          </div>
        </div>
      )}
    </Dialog>
  );
}
