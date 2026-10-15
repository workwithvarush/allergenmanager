import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { LoadingPlaceholder, Skeleton } from "@/components/Skeleton";
import { getMenus } from "@/lib/demo-data";
import { canManageMenus } from "@/lib/permissions";
import { getSessionUser } from "@/lib/session";
import { usesStandardMenus, VENUES } from "@/lib/venues";
import { MenuEditor } from "./MenuEditor";
import styles from "./MenuEditor.module.css";

export async function generateMetadata({ params }: PageProps<"/venues/[venueId]/menus">): Promise<Metadata> {
  const { venueId } = await params;
  const venue = VENUES.find((v) => v.id === venueId);
  return { title: `Menus · ${venue?.name ?? "Venue"} · Allergen Manager` };
}

/** The venue's standard menus, edited by supervisors and F&B managers. `?menu=ID` (or `new`) picks the one open. */
export default function MenusPage({ params, searchParams }: PageProps<"/venues/[venueId]/menus">) {
  return (
    <div className={styles.screen}>
      <Suspense fallback={<MenusLoading />}>
        <Menus params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Menus({
  params,
  searchParams,
}: {
  params: Promise<{ venueId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ venueId }, query] = await Promise.all([params, searchParams]);
  const venue = VENUES.find((v) => v.id === venueId && v.available);
  if (!venue) notFound();
  await connection();
  const user = await getSessionUser();

  const header = (subtitle: string) => (
    <div className={styles.header}>
      <h1 className={styles.title}>Menus</h1>
      <p className={styles.sub}>{subtitle}</p>
    </div>
  );

  if (!canManageMenus(user.role)) return header("Standard menus are managed by supervisors and F&B managers.");
  if (!usesStandardMenus(venue.id)) {
    return header(`${venue.name} builds each event's menu dish by dish, so it has no standard menus.`);
  }

  const menus = await getMenus(venue.id);
  const initialId = typeof query.menu === "string" ? query.menu : null;
  return (
    <>
      {header(`Standard menus offered when creating ${venue.name} events. Allergens are recorded per event.`)}
      <MenuEditor venueId={venue.id} venueName={venue.name} menus={menus} initialId={initialId} />
    </>
  );
}

function MenusLoading() {
  return (
    <LoadingPlaceholder label="Loading menus">
      <div className={styles.header}>
        <h1 className={styles.title}>Menus</h1>
        <Skeleton width={320} height={12} style={{ marginTop: 8 }} />
      </div>
      <div className={styles.layout}>
        <Skeleton height={240} style={{ borderRadius: 8 }} />
        <Skeleton height={420} style={{ borderRadius: 8 }} />
      </div>
    </LoadingPlaceholder>
  );
}
