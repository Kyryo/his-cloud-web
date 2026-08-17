import { Inter, Source_Sans_3 } from "next/font/google";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-landing-body",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
  variable: "--font-inter",
});

export default function BrandLayout({ children }: { children: ReactNode }) {
  return (
    <div
      data-brand-page
      className={cn(sourceSans.variable, inter.variable, sourceSans.className)}
    >
      {children}
    </div>
  );
}
