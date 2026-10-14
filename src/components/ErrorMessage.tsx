import type { ReactNode } from "react";
import { Button } from "@/components/Button";

type ErrorMessageProps = {
  /** Bold first line, e.g. "Today's events couldn't be loaded". */
  title?: ReactNode;
  /** What happened or what to do next. Keep it factual, no blame, no "!". */
  children?: ReactNode;
  /** Shows a "Try again" button. Pass Next's `reset` from error.tsx, or a refetch. */
  onRetry?: () => void;
  /** While true, the button is disabled and reads "Trying again…". */
  retrying?: boolean;
  retryLabel?: string;
};

/**
 * Red error banner with an optional retry button (`.banner-danger` in kit.css).
 * Announced immediately by screen readers (role="alert").
 */
export function ErrorMessage({ title, children, onRetry, retrying = false, retryLabel = "Try again" }: ErrorMessageProps) {
  return (
    <div className="banner banner-danger" role="alert">
      <svg
        className="banner-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
      <div className="banner-body">
        {title && <div className="banner-title">{title}</div>}
        {children && <div>{children}</div>}
      </div>
      {onRetry && (
        <Button variant="secondary" className="btn-sm banner-action" onClick={onRetry} disabled={retrying}>
          {retrying ? "Trying again…" : retryLabel}
        </Button>
      )}
    </div>
  );
}
