import { DM_Sans } from "next/font/google";

/** Authenticated app UI font (sidebar, pages, filter sheets). */
export const appFont = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-dm-sans",
});
