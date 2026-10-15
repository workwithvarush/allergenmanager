"use client";

import Link from "next/link";
import { Button } from "@/components/Button";
import { Dialog } from "@/components/Dialog";
import { DOCUMENTS } from "@/lib/print";
import { usePrinting } from "./PrintEvent";
import styles from "./PrintPage.module.css";

type PrintButtonProps = {
  /** Why the event can't print yet (e.g. incomplete dishes), or null. */
  blocked: string | null;
  className?: string;
  /** data-tour target for the guided tour. */
  tour?: string;
};

/** "Print all 3 documents" — gold, as the design system reserves gold for printing. */
export function PrintButton({ blocked, className, tour }: PrintButtonProps) {
  const { print, printing } = usePrinting();
  return (
    <Button
      variant="gold"
      className={className}
      data-tour={tour}
      // aria-disabled keeps it focusable so the reason can be heard.
      aria-disabled={blocked ? true : undefined}
      aria-describedby={blocked ? "print-blocked" : undefined}
      title={blocked ?? undefined}
      disabled={printing}
      onClick={() => !blocked && void print()}
    >
      {printing ? "Printing…" : "Print all 3 documents"}
    </Button>
  );
}

/** Shown when a print couldn't be recorded, e.g. the event changed while the print dialog was open. */
export function PrintError() {
  const { printError } = usePrinting();
  return (
    <div role="alert">
      {printError && (
        <div className={`banner banner-danger ${styles.banner}`}>
          <div className="banner-body">
            <div className="banner-title">Print not recorded</div>
            {printError}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Confirms a print, as in the prototype: what went to the printer and the stamp
 * every page carries, so counters can check they hold the current version.
 */
export function PrintedDialog({ eventName, dashboardHref }: { eventName: string; dashboardHref: string }) {
  const { printed, dismissPrinted, print } = usePrinting();
  if (!printed) return null;

  return (
    <Dialog
      open
      onClose={dismissPrinted}
      eyebrow={<span className={styles.printedEyebrow}>✓ Sent to printer</span>}
      title="All 3 documents printed"
      subtitle={`${eventName} · ${printed.stamp}`}
      footer={
        <>
          <Button variant="secondary" onClick={dismissPrinted} data-autofocus>
            Stay on preview
          </Button>
          <Link href={dashboardHref} className="btn btn-primary">
            Back to dashboard
          </Link>
        </>
      }
    >
      <div className="banner banner-success">
        <div className="banner-body">
          Distribute to counters — every page is stamped <strong>{printed.stamp}</strong>. Front-of-house staff can check
          it&apos;s the current version at a glance.
        </div>
      </div>
      <ul className={styles.printedDocs}>
        {DOCUMENTS.map((doc) => (
          <li key={doc.id} className={styles.printedDoc}>
            <span className={styles.printedIcon} aria-hidden="true">
              ▤
            </span>
            <span className={styles.printedDocText}>
              <span className={styles.printedDocTitle}>{doc.label}</span>
              <span className={styles.printedDocMeta}>{printed.stamp}</span>
            </span>
            <span className="badge badge-ready">Sent</span>
          </li>
        ))}
      </ul>
      <p className={styles.printedHint}>
        Nothing came out of the printer?{" "}
        <button
          type="button"
          className={styles.linkButton}
          onClick={() => {
            // Close the dialog first so it isn't printed over the documents.
            dismissPrinted();
            void print();
          }}
        >
          Print again
        </button>{" "}
        — the version stays the same.
      </p>
    </Dialog>
  );
}
