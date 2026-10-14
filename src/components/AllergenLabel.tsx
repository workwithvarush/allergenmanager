import { AllergenIcon } from "@/components/AllergenIcon";
import { allergenLabel, type AllergenId } from "@/lib/allergens";

type AllergenLabelProps = {
  allergen: AllergenId;
  /** "stacked": icon above an uppercase name, as in the printed sheet header.
   *  "inline": icon beside the name, for lists like "Contains". */
  layout?: "stacked" | "inline";
  /** Icon size in px. The printed sheet uses 52, 42 or 32 as dish count grows. */
  size?: number;
  /** Name size in px; defaults to the kit's xs text (11px). Print uses 10.5, 9 or 7.5. */
  labelSize?: number;
  className?: string;
};

/** Allergen icon with its name (`.allergen-label` in kit.css). */
export function AllergenLabel({ allergen, layout = "stacked", size = 32, labelSize, className }: AllergenLabelProps) {
  return (
    <span
      className={["allergen-label", `allergen-label-${layout}`, className].filter(Boolean).join(" ")}
      style={labelSize ? { fontSize: labelSize } : undefined}
    >
      {/* The name is visible text, so the image itself stays silent for screen readers. */}
      <AllergenIcon allergen={allergen} size={size} alt="" />
      {allergenLabel(allergen)}
    </span>
  );
}
