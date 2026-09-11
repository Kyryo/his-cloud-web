"use client";

import { Skeleton } from "@/components/ui/skeleton";
import type { VisitQueueSummary } from "@/features/visits/types/visit.types";
import { formatCompactNumber } from "@/utils/format-compact-number";

type VisitQueueSummaryCardsProps = {
  stats: VisitQueueSummary | null;
  isLoading?: boolean;
};

const EMPTY_STATS: VisitQueueSummary = {
  todays_visits: 0,
  todays_active_visits: 0,
  todays_completed_visits: 0,
  total_visits: 0,
};

export function VisitQueueSummaryCards({
  stats,
  isLoading = false,
}: VisitQueueSummaryCardsProps) {
  if (isLoading) {
    return (
      <div
        className="grid grid-cols-2 divide-y divide-dash-border/60 border-y border-dash-border/80 py-2 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x"
        data-testid="visit-queue-summary-stats"
        aria-busy="true"
      >
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="p-3.5 sm:p-4">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="mt-2.5 h-8 w-16" />
          </div>
        ))}
      </div>
    );
  }

  const buckets = stats ?? EMPTY_STATS;

  return (
    <dl
      className="grid grid-cols-2 divide-y divide-dash-border/60 border-y border-dash-border/80 py-2 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x"
      data-testid="visit-queue-summary-stats"
    >
      <div className="p-3.5 transition-colors hover:bg-dash-canvas/40 sm:p-4">
        <div className="flex items-center gap-2">
          <span className="size-2 shrink-0 rounded-full bg-teal-500" />
          <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-dash-muted">
            Today&apos;s visits
          </dt>
        </div>
        <dd className="mt-1 text-lg font-semibold tracking-tight text-brand-navy tabular-nums">
          {formatCompactNumber(buckets.todays_visits)}
        </dd>
      </div>

      <div className="p-3.5 transition-colors hover:bg-dash-canvas/40 sm:p-4">
        <div className="flex items-center gap-2">
          {buckets.todays_active_visits > 0 ? (
            <span className="relative flex size-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-violet-500" />
            </span>
          ) : (
            <span className="size-2 shrink-0 rounded-full bg-violet-500" />
          )}
          <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-dash-muted">
            Today&apos;s active
          </dt>
        </div>
        <dd className="mt-1 text-lg font-semibold tracking-tight text-brand-navy tabular-nums">
          {formatCompactNumber(buckets.todays_active_visits)}
        </dd>
      </div>

      <div className="p-3.5 transition-colors hover:bg-dash-canvas/40 sm:p-4">
        <div className="flex items-center gap-2">
          <span className="size-2 shrink-0 rounded-full bg-blue-500" />
          <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-dash-muted">
            Today&apos;s completed
          </dt>
        </div>
        <dd className="mt-1 text-lg font-semibold tracking-tight text-brand-navy tabular-nums">
          {formatCompactNumber(buckets.todays_completed_visits)}
        </dd>
      </div>

      <div className="p-3.5 transition-colors hover:bg-dash-canvas/40 sm:p-4">
        <div className="flex items-center gap-2">
          <span className="size-2 shrink-0 rounded-full bg-rose-500" />
          <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-dash-muted">
            Total visits
          </dt>
        </div>
        <dd className="mt-1 text-lg font-semibold tracking-tight text-brand-navy tabular-nums">
          {formatCompactNumber(buckets.total_visits)}
        </dd>
      </div>
    </dl>
  );
}
