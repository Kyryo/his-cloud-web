import type { ReactNode } from "react";

import {
  PAGE_STAT_LABEL_CLASS,
  PAGE_STAT_VALUE_CLASS,
} from "@/features/app-shell/components/page-layout/page-layout-typography";
import { cn } from "@/lib/utils";

/** Hairline insight strip used on list pages. No cards, no extra padding. */
export const LIST_PAGE_INSIGHT_STRIP_CLASS =
  "grid grid-cols-2 divide-y divide-dash-border/60 border-y border-dash-border/80 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x";

export const LIST_PAGE_INSIGHT_CELL_CLASS = "p-3";

export const LIST_PAGE_INSIGHT_LABEL_CLASS = PAGE_STAT_LABEL_CLASS;

export const LIST_PAGE_INSIGHT_VALUE_CLASS = PAGE_STAT_VALUE_CLASS;

type ListPageStatsSectionProps = {
  children: ReactNode;
  className?: string;
};

export function ListPageStatsSection({
  children,
  className,
}: ListPageStatsSectionProps) {
  return <div className={cn(className)}>{children}</div>;
}
