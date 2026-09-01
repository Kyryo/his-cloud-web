import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type DetailPageAsidePanelSectionProps = {
  children: ReactNode;
  className?: string;
};

export function DetailPageAsidePanelSection({
  children,
  className,
}: DetailPageAsidePanelSectionProps) {
  return (
    <aside
      className={cn(
        "order-first border-t border-dash-border/80 bg-white px-4 py-5 sm:px-6 xl:order-0 xl:border-l xl:border-t-0 xl:px-5",
        className,
      )}
    >
      <div className="space-y-4 xl:sticky xl:top-4">{children}</div>
    </aside>
  );
}
