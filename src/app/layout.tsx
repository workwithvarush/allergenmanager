import type { Metadata } from "next";
import { DM_Mono, DM_Sans } from "next/font/google";
import { ThemeStyle } from "@/theme/ThemeStyle";
import "@/styles/design-system/styles.css";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Allergen Manager",
  description: "Allergen documentation for Nottingham Venues",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-GB" className={`${dmSans.variable} ${dmMono.variable}`}>
      <head>
        <ThemeStyle />
      </head>
      <body>{children}</body>
    </html>
  );
}
