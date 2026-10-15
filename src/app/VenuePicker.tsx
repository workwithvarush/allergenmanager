"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { NottinghamVenuesLogo } from "@/components/NottinghamVenuesLogo";
import type { Venue } from "@/lib/venues";
import { checkLogin } from "./actions";
import { LoginDialog, type LoginDetails } from "./LoginDialog";
import styles from "./VenuePicker.module.css";

export function VenuePicker({ venues }: { venues: readonly Venue[] }) {
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  // Bumped on each open so the login form starts empty every time.
  const [loginAttempt, setLoginAttempt] = useState(0);
  const router = useRouter();

  const openLogin = (next: Venue) => {
    setVenue(next);
    setLoginAttempt((n) => n + 1);
    setLoginOpen(true);
  };

  // Placeholder until authentication is decided: the details aren't kept yet (see lib/session.ts).
  const logIn = async ({ email }: LoginDetails) => {
    if (!venue) return;
    const result = await checkLogin(email).catch(() => ({
      ok: false as const,
      message: "Couldn't reach the server. Check your connection and try again.",
    }));
    if (!result.ok) throw new Error(result.message);
    setLoginOpen(false);
    router.push(`/venues/${venue.id}/dashboard`);
  };

  return (
    <div className={styles.page}>
      <main className={styles.centre}>
        <div className={styles.column}>
          <div className={styles.brand}>
            <NottinghamVenuesLogo height={86} preload />
            <div className={styles.product}>Allergen manager</div>
          </div>
          <h1 className={styles.title}>Select a venue</h1>
          <p className={styles.subtitle}>Choose a venue to manage allergen documentation.</p>
          <ul className={styles.list}>
            {venues.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={styles.card}
                  disabled={!item.available}
                  onClick={() => openLogin(item)}
                >
                  <span>
                    <span className={styles.name}>{item.name}</span>
                    <span className={styles.meta}>{item.description}</span>
                    {!item.available && item.unavailableReason && (
                      <span className={styles.meta}>{item.unavailableReason}</span>
                    )}
                  </span>
                  <span className={item.available ? "badge badge-ready" : "badge badge-neutral"}>
                    {item.available ? "Available" : "Coming soon"}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <footer className={styles.footer}>Nottingham Venues · Allergen Manager</footer>

      {venue && (
        <LoginDialog
          key={loginAttempt}
          venue={venue}
          open={loginOpen}
          onClose={() => setLoginOpen(false)}
          onLogIn={logIn}
        />
      )}
    </div>
  );
}
