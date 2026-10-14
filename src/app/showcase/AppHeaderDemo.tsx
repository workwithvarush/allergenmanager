"use client";

import { useState } from "react";
import { AppHeader } from "@/components/AppHeader";

const NAV = [
  { href: "/showcase", label: "Dashboard" }, // points at this page so the current-tab style shows
  { href: "/change-log", label: "Change log" },
  { href: "/archive", label: "Archive" },
];

export function AppHeaderDemo() {
  const [loggedOut, setLoggedOut] = useState(false);
  return (
    <div className="app-frame">
      <AppHeader
        venueName="EMCC"
        nav={NAV}
        user={{ name: "Jamie Baker", role: "Chef" }}
        onLogOut={() => setLoggedOut(true)}
      />
      {loggedOut && (
        <p className="t-small" role="status" style={{ padding: "8px 24px", margin: 0 }}>
          Logged out (confirmed).
        </p>
      )}
    </div>
  );
}
