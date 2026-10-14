export type EventStatus = "incomplete" | "ready" | "reprint" | "pending-review";

const STATUS: Record<EventStatus, { label: string; className: string }> = {
  incomplete: { label: "Incomplete", className: "badge-danger" },
  ready: { label: "Ready", className: "badge-ready" },
  reprint: { label: "Reprint required", className: "badge-warn" },
  "pending-review": { label: "Pending review", className: "badge-brand" },
};

/** Event status pill with a coloured dot (`.badge` in kit.css). */
export function StatusBadge({ status }: { status: EventStatus }) {
  const { label, className } = STATUS[status];
  return (
    <span className={`badge ${className}`}>
      <span className="badge-dot" aria-hidden="true" />
      {label}
    </span>
  );
}
