import { useId, type ReactNode } from "react";

type ProgressBarProps = {
  value: number;
  max: number;
  /** Shown above the bar and used as its accessible name, e.g. "3 of 8 dishes completed". */
  label: ReactNode;
};

/**
 * Labelled progress bar (`.progress-*` in kit.css). Turns green when
 * `value` reaches `max`.
 */
export function ProgressBar({ value, max, label }: ProgressBarProps) {
  const labelId = useId();
  const clamped = Math.min(Math.max(value, 0), max);
  const complete = max > 0 && clamped >= max;
  const exact = max > 0 ? (clamped / max) * 100 : 0;
  // Round like the prototype (5 of 8 → 63%), but only show 100% when actually complete.
  const percent = complete ? 100 : Math.min(Math.round(exact), 99);

  return (
    <div>
      <div className="progress-head">
        <span id={labelId} className="progress-label">
          {label}
        </span>
        <span className="progress-value" aria-hidden="true">
          {percent}%
        </span>
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-labelledby={labelId}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={clamped}
      >
        <div className={complete ? "progress-fill complete" : "progress-fill"} style={{ width: `${exact}%` }} />
      </div>
    </div>
  );
}
