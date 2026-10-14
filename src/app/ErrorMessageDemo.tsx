"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { ErrorMessage } from "@/components/ErrorMessage";

export function ErrorMessageDemo() {
  const [state, setState] = useState<"failed" | "retrying" | "loaded">("failed");

  const retry = () => {
    setState("retrying");
    setTimeout(() => setState("loaded"), 1200);
  };

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <ErrorMessage>3 dishes have not been completed. Complete all dishes before printing.</ErrorMessage>
      {state === "loaded" ? (
        <div className="banner banner-success" role="status">
          <div className="banner-body">Today&apos;s events loaded.</div>
          <Button variant="secondary" className="btn-sm banner-action" onClick={() => setState("failed")}>
            Reset demo
          </Button>
        </div>
      ) : (
        <ErrorMessage
          title="Today's events couldn't be loaded"
          onRetry={retry}
          retrying={state === "retrying"}
        >
          The connection to the server was lost. Check the connection, then try again.
        </ErrorMessage>
      )}
    </div>
  );
}
