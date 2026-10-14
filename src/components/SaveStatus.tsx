export type SaveState = "idle" | "saving" | "saved" | "error";

type SaveStatusProps = {
  state: SaveState;
  /** When the last save finished; shown as "Saved 11:47". */
  savedAt?: Date;
  /** Shows a "Try again" link when saving fails. */
  onRetry?: () => void;
};

const time = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" });

const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

/**
 * Inline "Saving… / Saved / Failed to save" indicator (`.save-status` in kit.css).
 * The wrapper is a polite live region, so screen readers hear each change;
 * it stays mounted (empty when idle) so the first announcement isn't missed.
 */
export function SaveStatus({ state, savedAt, onRetry }: SaveStatusProps) {
  return (
    <span className={`save-status save-status-${state}`} role="status">
      {state === "saving" && (
        <>
          <span className="save-status-spinner" aria-hidden="true" />
          Saving…
        </>
      )}
      {state === "saved" && (
        <>
          <svg {...iconProps}>
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {savedAt ? `Saved ${time.format(savedAt)}` : "Saved"}
        </>
      )}
      {state === "error" && (
        <>
          <svg {...iconProps}>
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          Failed to save
          {onRetry && (
            <>
              {" · "}
              <button type="button" className="save-status-retry" onClick={onRetry}>
                Try again
              </button>
            </>
          )}
        </>
      )}
    </span>
  );
}
