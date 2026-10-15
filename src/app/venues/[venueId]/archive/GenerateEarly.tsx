"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/Button";
import { Dialog } from "@/components/Dialog";
import { generateArchiveEarly } from "./actions";
import styles from "./Archive.module.css";

type GenerateEarlyProps = {
  venueId: string;
  /** "1–15 October". */
  coverage: string;
  /** "31 October" — when the full month's archive issues. */
  issueDay: string;
  /** Button text: "Generate early" in the archive list, longer on the Change log page. */
  label?: string;
};

/**
 * "Generate early" and the prototype's "Generate archive early" confirmation:
 * the record covers the month so far, is marked partial and can't be edited.
 * Once generated, the archive document opens.
 */
export function GenerateEarly({ venueId, coverage, issueDay, label = "Generate early" }: GenerateEarlyProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const generate = () =>
    startTransition(async () => {
      setError(null);
      const result = await generateArchiveEarly(venueId).catch(() => ({
        ok: false as const,
        message: "The archive wasn't generated — the server could not be reached.",
      }));
      if (!result.ok) {
        setError(result.message);
        return;
      }
      // As in the prototype, open the archive. If this month's already existed, that one stands — say so there.
      router.push(`/venues/${venueId}/archive/${result.ref}${result.existing ? "?existing=1" : ""}`);
    });

  return (
    <>
      <Button variant="secondary" className="btn-sm" onClick={() => setConfirming(true)}>
        {label}
      </Button>
      {confirming && (
        <Dialog
          open
          onClose={() => !pending && setConfirming(false)}
          title="Generate archive early"
          footer={
            <>
              <Button variant="secondary" onClick={() => setConfirming(false)} disabled={pending} data-autofocus>
                Cancel
              </Button>
              <Button onClick={generate} disabled={pending}>
                {pending ? "Generating…" : "Generate archive"}
              </Button>
            </>
          }
        >
          <p className={styles.dialogBody}>
            This archive will cover {coverage} only and downloads as a PDF. Once generated it cannot be edited.
            Continue?
          </p>
          <div className="banner banner-warn">
            <svg className="banner-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 9v4M12 17h.01" />
              <path d="M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
            </svg>
            <div className="banner-body">
              The document will be marked as a partial record. The full month&apos;s archive is issued automatically on{" "}
              {issueDay}.
            </div>
          </div>
          {error && (
            <div className="banner banner-danger" role="alert">
              <div className="banner-body">{error}</div>
            </div>
          )}
        </Dialog>
      )}
    </>
  );
}
