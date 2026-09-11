import { Figtree, Fraunces, Plus_Jakarta_Sans } from "next/font/google";

/** Authenticated app UI font (sidebar, pages, filter sheets). */
export const appFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-app",
});

/** Marketing + auth display (headlines, wordmark). */
export const landingDisplay = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-bricolage",
});

/** Marketing + auth body. */
export const landingBody = Figtree({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-landing-body",
});
