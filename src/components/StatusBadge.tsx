export type EventStatus = "incomplete" | "ready" | "reprint" | "pending-review";

const STATUS: Record<EventStatus, { label: string; short: string; className: string }> = {
  incomplete: { label: "Incomplete", short: "Incomplete", className: "badge-danger" },
  ready: { label: "Ready", short: "Ready", className: "badge-ready" },
  reprint: { label: "Reprint required", short: "Reprint", className: "badge-warn" },
  "pending-review": { label: "Pending review", short: "Pending review", className: "badge-brand" },
};

type StatusBadgeProps = {
  status: EventStatus;
  /** Rounded, borderless pill with the short label ("Reprint"), as on dashboard event rows. */
  pill?: boolean;
};

/** Event status with a coloured dot (`.badge` in kit.css). */
export function StatusBadge({ status, pill = false }: StatusBadgeProps) {
  const { label, short, className } = STATUS[status];
  return (
    <span className={`badge ${className}${pill ? " badge-pill" : ""}`}>
      <span className="badge-dot" aria-hidden="true" />
      {pill ? short : label}
    </span>
  );
}
