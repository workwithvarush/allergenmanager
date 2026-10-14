"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LogOutDialog } from "@/components/LogOutDialog";
import { NottinghamVenuesLogo } from "@/components/NottinghamVenuesLogo";

export type NavItem = { href: string; label: string };

export type HeaderUser = { name: string; role: string };

type AppHeaderProps = {
  /** Shown as "Allergen manager · EMCC" and in the log-out confirmation. */
  venueName: string;
  /** Where the logo goes, e.g. the venue picker. */
  homeHref?: string;
  /** Pages in the segmented nav; the one matching the current URL is highlighted. */
  nav: readonly NavItem[];
  user: HeaderUser;
  /** Runs after the user confirms "Log out of {venue}?". */
  onLogOut: () => void;
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : (parts[0] ?? "").slice(0, 2);
  return letters.toUpperCase();
}

/**
 * App top bar: logo and venue, page nav, signed-in user and log out
 * (`.topnav-*` in kit.css). Log out asks for confirmation first.
 */
export function AppHeader({ venueName, homeHref = "/", nav, user, onLogOut }: AppHeaderProps) {
  const pathname = usePathname();
  const isCurrent = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const [confirmingLogOut, setConfirmingLogOut] = useState(false);

  return (
    <header className="topnav">
      <Link href={homeHref} className="topnav-home">
        <NottinghamVenuesLogo height={30} />
        <span className="topnav-home-label">Allergen manager · {venueName}</span>
      </Link>
      <div className="topnav-right">
        <nav className="topnav-tabs" aria-label="Main">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="topnav-tab"
              aria-current={isCurrent(item.href) ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="topnav-user">
          <span className="topnav-avatar" aria-hidden="true">
            {initials(user.name)}
          </span>
          <div>
            <div className="topnav-user-name">{user.name}</div>
            <div className="topnav-user-role">{user.role}</div>
          </div>
          <button type="button" className="topnav-logout" onClick={() => setConfirmingLogOut(true)}>
            Log out
          </button>
        </div>
      </div>
      <LogOutDialog
        venueName={venueName}
        open={confirmingLogOut}
        onCancel={() => setConfirmingLogOut(false)}
        onConfirm={() => {
          setConfirmingLogOut(false);
          onLogOut();
        }}
      />
    </header>
  );
}
