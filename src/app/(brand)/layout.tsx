import { Figtree, Fraunces } from "next/font/google";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const landingDisplay = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
  variable: "--font-bricolage",
});

const landingBody = Figtree({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-landing-body",
});

export default function BrandLayout({ children }: { children: ReactNode }) {
  return (
    <div
      data-brand-page
      className={cn(
        landingDisplay.variable,
        landingBody.variable,
        landingBody.className,
      )}
    >
      {children}
    </div>
  );
}
