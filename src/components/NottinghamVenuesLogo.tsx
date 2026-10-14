import Image from "next/image";
import logo from "@/assets/brand/nottingham-venues-logo.png";

type NottinghamVenuesLogoProps = {
  /** Rendered height in px; width follows the 300×122 aspect ratio.
   *  The prototype uses 30 in the top nav and 40 on printed documents. */
  height?: number;
  /** Load eagerly — set on above-the-fold placements like the venue picker. */
  preload?: boolean;
  className?: string;
};

export function NottinghamVenuesLogo({ height = 30, preload, className }: NottinghamVenuesLogoProps) {
  return (
    <Image
      src={logo}
      alt="Nottingham Venues"
      height={height}
      width={Math.round((height * logo.width) / logo.height)}
      preload={preload}
      className={className}
    />
  );
}
