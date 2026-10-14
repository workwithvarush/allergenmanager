"use client";

import { Button } from "@/components/Button";
import { Dialog } from "@/components/Dialog";

type LogOutDialogProps = {
  venueName: string;
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

/** "Log out of EMCC?" confirmation from the prototype. Focus starts on the safe choice. */
export function LogOutDialog({ venueName, open, onCancel, onConfirm }: LogOutDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      size="xs"
      title={`Log out of ${venueName}?`}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} data-autofocus>
            Stay logged in
          </Button>
          <Button onClick={onConfirm}>Log out</Button>
        </>
      }
    >
      <p className="t-body" style={{ margin: 0, color: "var(--fg-3)", lineHeight: 1.55 }}>
        Allergen entries are saved automatically, so nothing is lost by logging out.
      </p>
    </Dialog>
  );
}
