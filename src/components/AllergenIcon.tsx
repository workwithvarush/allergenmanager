import Image, { type StaticImageData } from "next/image";
import { allergenLabel, type AllergenId } from "@/lib/allergens";
import celery from "@/assets/allergens/celery.png";
import crustaceans from "@/assets/allergens/crustaceans.png";
import eggs from "@/assets/allergens/eggs.png";
import fish from "@/assets/allergens/fish.png";
import gluten from "@/assets/allergens/gluten.png";
import lupin from "@/assets/allergens/lupin.png";
import milk from "@/assets/allergens/milk.png";
import molluscs from "@/assets/allergens/molluscs.png";
import mustard from "@/assets/allergens/mustard.png";
import peanuts from "@/assets/allergens/peanuts.png";
import sesame from "@/assets/allergens/sesame.png";
import soya from "@/assets/allergens/soya.png";
import sulphites from "@/assets/allergens/sulphites.png";
import treeNuts from "@/assets/allergens/tree-nuts.png";

const ICONS: Record<AllergenId, StaticImageData> = {
  gluten,
  eggs,
  fish,
  crustaceans,
  peanuts,
  soya,
  celery,
  milk,
  "tree-nuts": treeNuts,
  mustard,
  sesame,
  sulphites,
  lupin,
  molluscs,
};

type AllergenIconProps = {
  allergen: AllergenId;
  /** Rendered width and height in px. Source images are 200×200. */
  size?: number;
  /** Pass "" when a visible label sits next to the icon. Defaults to the allergen name. */
  alt?: string;
  className?: string;
};

export function AllergenIcon({ allergen, size = 24, alt, className }: AllergenIconProps) {
  return (
    <Image
      src={ICONS[allergen]}
      alt={alt ?? allergenLabel(allergen)}
      width={size}
      height={size}
      className={className}
      // Circle clip, as in the prototype; the gluten source art is cropped too tightly without it.
      style={{ borderRadius: "50%" }}
    />
  );
}
