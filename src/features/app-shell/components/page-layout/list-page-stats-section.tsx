import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type ListPageStatsSectionProps = {
  children: ReactNode;
  className?: string;
};

export function ListPageStatsSection({
  children,
  className,
}: ListPageStatsSectionProps) {
  return <div className={className}>{children}</div>;
}
