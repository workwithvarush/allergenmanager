import type { ReactNode } from "react";

type StatTileProps = {
  /** The headline figure, e.g. 4 or "3/4". */
  value: ReactNode;
  /** Short caption under the figure, e.g. "Events"; shown in caps. */
  label: string;
  /** "brand" highlights the tile in forest, as for Pending review. */
  tone?: "default" | "brand";
};

/** Dashboard summary tile (`.stat-card` in kit.css). */
export function StatTile({ value, label, tone = "default" }: StatTileProps) {
  return (
    <div className={tone === "brand" ? "stat-card stat-card-brand" : "stat-card"}>
      <div className="stat-card-num">{value}</div>
      <div className="stat-card-label">{label}</div>
    </div>
  );
}
