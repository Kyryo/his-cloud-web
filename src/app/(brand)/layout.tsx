import type { ReactNode } from "react";

import { BrandFooter } from "@/features/brand/components/BrandFooter";
import { Navigation } from "@/features/brand/components/Navigation";
import { cn } from "@/lib/utils";
import { landingBody, landingDisplay } from "@/lib/fonts";

export default function BrandLayout({ children }: { children: ReactNode }) {
  return (
    <div
      data-brand-page
      className={cn(
        "min-h-dvh bg-white",
        landingDisplay.variable,
        landingBody.variable,
        landingBody.className,
      )}
    >
      <a href="#main-content" className="landing-skip-link">
        Skip to main content
      </a>
      <Navigation />
      <div id="main-content">{children}</div>
      <BrandFooter />
    </div>
  );
}
