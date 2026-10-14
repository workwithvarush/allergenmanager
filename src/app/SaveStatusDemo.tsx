"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { SaveStatus, type SaveState } from "@/components/SaveStatus";

export function SaveStatusDemo() {
  const [state, setState] = useState<SaveState>("idle");
  const [savedAt, setSavedAt] = useState<Date>();

  const save = (succeed: boolean) => {
    setState("saving");
    setTimeout(() => {
      if (succeed) {
        setSavedAt(new Date());
        setState("saved");
      } else {
        setState("error");
      }
    }, 1200);
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
      <SaveStatus state="saving" />
      <SaveStatus state="saved" />
      <SaveStatus state="error" />
      <span style={{ flex: 1 }} />
      <Button variant="secondary" onClick={() => save(true)}>
        Simulate save
      </Button>
      <Button variant="secondary" onClick={() => save(false)}>
        Simulate failure
      </Button>
      <span data-testid="live-save-status">
        <SaveStatus state={state} savedAt={savedAt} onRetry={() => save(true)} />
      </span>
    </div>
  );
}
