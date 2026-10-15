"use client";

import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import type { SessionUser } from "@/lib/session";

type VenueHeaderProps = {
  venueId: string;
  venueName: string;
  user: SessionUser;
};

/** AppHeader wired to this venue's pages. Log out returns to the venue picker. */
export function VenueHeader({ venueId, venueName, user }: VenueHeaderProps) {
  const router = useRouter();
  // Archive joins the nav once that page exists.
  const nav = [
    { href: `/venues/${venueId}/dashboard`, label: "Dashboard" },
    { href: `/venues/${venueId}/calendar`, label: "Calendar" },
    { href: `/venues/${venueId}/changelog`, label: "Change log" },
  ];

  return (
    <AppHeader
      venueName={venueName}
      nav={nav}
      user={user}
      // Placeholder: no session to end yet, so just leave the venue.
      onLogOut={() => router.push("/")}
    />
  );
}
