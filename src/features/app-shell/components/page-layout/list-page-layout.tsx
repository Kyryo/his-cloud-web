import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type ListPageLayoutProps = {
  children: ReactNode;
  className?: string;
  "data-testid"?: string;
};

export function ListPageLayout({
  children,
  className,
  "data-testid": dataTestId,
}: ListPageLayoutProps) {
  return (
    <div
      className={cn("space-y-4 pb-20 pt-4 sm:pb-4", className)}
      data-testid={dataTestId}
    >
      {children}
    </div>
  );
}
