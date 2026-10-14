import type { Metadata } from "next";
import { VENUES } from "@/lib/venues";
import { VenuePicker } from "./VenuePicker";

export const metadata: Metadata = {
  title: "Select a venue · Allergen Manager",
};

export default function Home() {
  return <VenuePicker venues={VENUES} />;
}
