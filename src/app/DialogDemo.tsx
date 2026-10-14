"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { Dialog } from "@/components/Dialog";
import { TextField } from "@/components/TextField";

export function DialogDemo() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Open dialog
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        eyebrow="Shared venue login"
        title="Log in to EMCC"
        subtitle="East Midlands Conference Centre"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setOpen(false)}>Log in</Button>
          </>
        }
      >
        <TextField label="Your name" placeholder="e.g. Jamie Baker" hint="Tracked individually on this shared venue login." />
        <TextField label="Email" type="email" placeholder="name@nottinghamvenues.com" />
      </Dialog>
    </>
  );
}
