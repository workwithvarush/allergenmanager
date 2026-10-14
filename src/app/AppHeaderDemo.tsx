"use client";

import { useState } from "react";
import { AppHeader } from "@/components/AppHeader";

const NAV = [
  { href: "/", label: "Dashboard" },
  { href: "/change-log", label: "Change log" },
  { href: "/archive", label: "Archive" },
];

export function AppHeaderDemo() {
  const [loggedOut, setLoggedOut] = useState(false);
  return (
    <div className="app-frame">
      <AppHeader
        title="Allergen manager · EMCC"
        nav={NAV}
        user={{ name: "Jamie Baker", role: "Chef" }}
        onLogOut={() => setLoggedOut(true)}
      />
      {loggedOut && (
        <p className="t-small" role="status" style={{ padding: "8px 24px", margin: 0 }}>
          Log out clicked.
        </p>
      )}
    </div>
  );
}
