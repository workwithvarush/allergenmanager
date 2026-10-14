import type { ReactNode } from "react";

type StatTileProps = {
  /** The headline figure, e.g. 4 or "3/4". */
  value: ReactNode;
  /** Short caption under the figure, e.g. "Events"; shown in caps. */
  label: string;
  /** "brand": filled forest highlight (Pending review). "outline": white with a forest border (cross-venue totals). */
  tone?: "default" | "brand" | "outline";
};

/** Dashboard summary tile (`.stat-card` in kit.css). */
export function StatTile({ value, label, tone = "default" }: StatTileProps) {
  return (
    <div className={tone === "default" ? "stat-card" : `stat-card stat-card-${tone}`}>
      <div className="stat-card-num">{value}</div>
      <div className="stat-card-label">{label}</div>
    </div>
  );
}
