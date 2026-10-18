import { EB_Garamond, IBM_Plex_Mono } from "next/font/google";
import localFont from "next/font/local";

export const garamond = EB_Garamond({ subsets: ["latin", "latin-ext"], variable: "--font-garamond", display: "swap" });

export const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const amiri = localFont({
  src: [
    { path: "./fonts/Amiri-Regular-arabic.woff2", weight: "400", style: "normal" },
    { path: "./fonts/Amiri-Bold-arabic.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-amiri",
  display: "swap",
  adjustFontFallback: false,
  declarations: [{ prop: "size-adjust", value: "140%" }],
});
