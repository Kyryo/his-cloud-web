import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { landingBody, landingDisplay } from "@/lib/fonts";

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
