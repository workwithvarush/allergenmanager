"use client";

import { useId, useState } from "react";
import { Button } from "@/components/Button";
import { MAX_NOTE, SHORT_NOTE } from "@/lib/events";
import styles from "./EventEntry.module.css";

type NoteEditorProps = {
  /** e.g. "Gluten". */
  allergenLabel: string;
  /** The current note, or "" for none. */
  initial: string;
  /** Saves the note; "" removes it. */
  onSave: (text: string) => void;
  onCancel: () => void;
};

/** Inline editor for one allergen's ingredient note, as in the prototype. Enter saves, Esc cancels. */
export function NoteEditor({ allergenLabel, initial, onSave, onCancel }: NoteEditorProps) {
  const [draft, setDraft] = useState(initial);
  const inputId = useId();
  const hintId = useId();

  return (
    <div
      className={styles.noteEditor}
      onKeyDown={(e) => {
        if (e.key !== "Escape") return;
        e.preventDefault();
        onCancel();
      }}
    >
      <label htmlFor={inputId} className={styles.noteLabel}>
        {allergenLabel} note
      </label>
      <input
        id={inputId}
        className={`input ${styles.noteInput}`}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key !== "Enter") return;
          e.preventDefault();
          onSave(draft);
        }}
        placeholder="e.g. GF oats"
        maxLength={MAX_NOTE}
        aria-describedby={hintId}
        autoComplete="off"
        // The editor opens because the user asked for it, so focus moves straight in.
        autoFocus
      />
      <Button className="btn-sm" onClick={() => onSave(draft)}>
        Save
      </Button>
      {initial && (
        <Button variant="secondary" className="btn-sm" onClick={() => onSave("")}>
          Remove
        </Button>
      )}
      <button type="button" className={styles.noteCancel} onClick={onCancel}>
        Cancel
      </button>
      <p id={hintId} className={styles.noteHint}>
        {draft.trim().length > SHORT_NOTE
          ? `Long notes shrink the printed matrix — keep it under about ${SHORT_NOTE} characters where possible. `
          : ""}
        Replaces the ✕ or M in this column on the printed sheet, and appears in Contains on the placecard.
      </p>
    </div>
  );
}
