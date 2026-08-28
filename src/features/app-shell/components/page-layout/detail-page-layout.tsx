import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type DetailPageLayoutProps = {
  children: ReactNode;
  className?: string;
  "data-testid"?: string;
};

export function DetailPageLayout({
  children,
  className,
  "data-testid": dataTestId,
}: DetailPageLayoutProps) {
  return (
    <div
      data-page-surface="card"
      className={cn("flex min-h-0 w-full flex-1 flex-col", className)}
      data-testid={dataTestId}
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-dash-border bg-dash-panel">
        <div className="min-h-0 flex-1 overflow-auto pb-20 xl:pb-0">
          {children}
        </div>
      </div>
    </div>
  );
}
