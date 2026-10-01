import type { Metadata, Viewport } from "next";
import { cjk, display, ui } from "@/lib/fonts";
import { companyInfo } from "@/data/content";
import "./globals.css";
import "./ui.css";
import "./chapters.css";
import "./editorial.css";

export const metadata: Metadata = {
  title: `${companyInfo.shortName} — ${companyInfo.tagline}`,
  description:
    "NIMBUSWORLD Education Consultancy, Pune — study abroad counselling, international education guidance, language classes and professional courses.",
};

export const viewport: Viewport = {
  themeColor: "#06080D",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${ui.variable} ${cjk.variable}`}>
      <body>{children}</body>
    </html>
  );
}
