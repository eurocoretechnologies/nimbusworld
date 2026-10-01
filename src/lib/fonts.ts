import { Cormorant_Garamond, Manrope, Noto_Serif_JP } from "next/font/google";

export const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

export const ui = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ui",
  display: "swap",
});

/** Japanese / Chinese glyphs (Languages). Not preloaded: only the slices used are fetched. */
export const cjk = Noto_Serif_JP({
  subsets: ["latin"],
  weight: ["300", "400"],
  variable: "--font-cjk",
  display: "swap",
  preload: false,
});

/** Resolved family names for canvas-printed page typography. */
export const canvasFonts = {
  display: display.style.fontFamily,
  ui: ui.style.fontFamily,
  cjk: cjk.style.fontFamily,
};
