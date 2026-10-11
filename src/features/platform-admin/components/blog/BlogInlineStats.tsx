import type { ReactNode } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { PAGE_STAT_LABEL_CLASS } from "@/features/app-shell/components/page-layout";
import { cn } from "@/lib/utils";

export type BlogInlineStat = {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tag?: ReactNode;
};

type BlogInlineStatsProps = {
  stats: BlogInlineStat[];
  isLoading?: boolean;
  className?: string;
};

/** A single flat row of figures separated by hairlines. No tiles. */
export function BlogInlineStats({ stats, isLoading = false, className }: BlogInlineStatsProps) {
  return (
    <dl className={cn("flex flex-wrap gap-y-4 divide-dash-border/80 sm:divide-x", className)}>
      {stats.map((stat) => (
        <div key={stat.label} className="min-w-[8.5rem] flex-1 pr-6 sm:px-6 sm:first:pl-0">
          <dt className={cn("flex items-center gap-1.5", PAGE_STAT_LABEL_CLASS)}>
            {stat.label}
            {stat.tag}
          </dt>
          <dd className="mt-1.5 flex items-baseline gap-2">
            {isLoading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <span className="text-2xl font-semibold tracking-tight text-brand-navy tabular-nums">{stat.value}</span>
            )}
            {stat.hint && !isLoading ? <span className="text-xs text-dash-muted">{stat.hint}</span> : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}
