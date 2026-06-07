import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type ListPageTableSectionProps = {
  children: ReactNode;
  className?: string;
};

export function ListPageTableSection({
  children,
  className,
}: ListPageTableSectionProps) {
  return <div className={cn(className)}>{children}</div>;
}

type ListPageDataSectionsStackProps = {
  children: ReactNode;
  className?: string;
};

/** Groups stats and toolbar sections with consistent spacing. */
export function ListPageDataSectionsStack({
  children,
  className,
}: ListPageDataSectionsStackProps) {
  return <div className={cn("space-y-4", className)}>{children}</div>;
}
