"use client";

import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { canCreateEvents, canManageMenus, canManageStaff, canViewArchive } from "@/lib/permissions";
import { usesStandardMenus, type VenueId } from "@/lib/venues";
import type { PostPrintAlerts } from "@/lib/notifications";
import type { SessionUser } from "@/lib/session";
import { NotificationsBell } from "./NotificationsBell";
import { Tour } from "./tour/Tour";

type VenueHeaderProps = {
  venueId: string;
  venueName: string;
  user: SessionUser;
  /** Post-print changes for the bell, as the page loaded. */
  alerts: PostPrintAlerts;
  /** Event the tour uses for its entry and print steps, or null if the venue has none. */
  tourEventId: string | null;
};

/** AppHeader wired to this venue's pages. Log out returns to the venue picker. */
export function VenueHeader({ venueId, venueName, user, alerts, tourEventId }: VenueHeaderProps) {
  const router = useRouter();
  const nav = [
    { href: `/venues/${venueId}/dashboard`, label: "Dashboard", tour: "nav-dashboard" },
    { href: `/venues/${venueId}/calendar`, label: "Calendar" },
    { href: `/venues/${venueId}/changelog`, label: "Change log", tour: "nav-changelog" },
    // As in the prototype, Allergen Members don't see the archive.
    ...(canViewArchive(user.role) ? [{ href: `/venues/${venueId}/archive`, label: "Archive", tour: "nav-archive" }] : []),
    ...(canManageMenus(user.role) && usesStandardMenus(venueId as VenueId)
      ? [{ href: `/venues/${venueId}/menus`, label: "Menus" }]
      : []),
    ...(canManageStaff(user.role) ? [{ href: `/venues/${venueId}/staff`, label: "Staff" }] : []),
  ];

  return (
    <AppHeader
      venueName={venueName}
      nav={nav}
      user={user}
      tools={
        <div className="topnav-tools">
          <NotificationsBell venueId={venueId} initial={alerts} />
          <Tour
            venueId={venueId}
            eventId={tourEventId}
            canCreate={canCreateEvents(user.role)}
            canArchive={canViewArchive(user.role)}
          />
        </div>
      }
      // Placeholder: no session to end yet, so just leave the venue.
      onLogOut={() => router.push("/")}
    />
  );
}
