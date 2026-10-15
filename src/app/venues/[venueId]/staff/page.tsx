import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { LoadingPlaceholder, Skeleton } from "@/components/Skeleton";
import { getStaff } from "@/lib/demo-data";
import { canManageStaff } from "@/lib/permissions";
import { getSessionUser } from "@/lib/session";
import { normaliseEmail } from "@/lib/staff";
import { VENUES } from "@/lib/venues";
import { StaffAdmin } from "./StaffAdmin";
import styles from "./Staff.module.css";

export async function generateMetadata({ params }: PageProps<"/venues/[venueId]/staff">): Promise<Metadata> {
  const { venueId } = await params;
  const venue = VENUES.find((v) => v.id === venueId);
  return { title: `Staff · ${venue?.name ?? "Venue"} · Allergen Manager` };
}

/** Staff accounts, shared by every venue. F&B managers add people, change roles and disable accounts. */
export default function StaffPage({ params }: PageProps<"/venues/[venueId]/staff">) {
  return (
    <div className={styles.screen}>
      <Suspense fallback={<StaffLoading />}>
        <Staff params={params} />
      </Suspense>
    </div>
  );
}

async function Staff({ params }: { params: Promise<{ venueId: string }> }) {
  const { venueId } = await params;
  const venue = VENUES.find((v) => v.id === venueId && v.available);
  if (!venue) notFound();
  await connection();
  const user = await getSessionUser();

  const header = (subtitle: string) => (
    <div className={styles.header}>
      <h1 className={styles.title}>Staff</h1>
      <p className={styles.sub}>{subtitle}</p>
    </div>
  );

  if (!canManageStaff(user.role)) return header("Staff accounts are managed by F&B managers.");

  return (
    <>
      {header(
        "Everyone who can log in, at every venue. Disabled accounts can't log in; their names stay on change logs and archives.",
      )}
      <StaffAdmin staff={await getStaff()} selfEmail={normaliseEmail(user.email)} />
    </>
  );
}

function StaffLoading() {
  return (
    <LoadingPlaceholder label="Loading staff">
      <div className={styles.header}>
        <h1 className={styles.title}>Staff</h1>
        <Skeleton width={360} height={12} style={{ marginTop: 8 }} />
      </div>
      <Skeleton height={360} style={{ borderRadius: 8 }} />
    </LoadingPlaceholder>
  );
}
