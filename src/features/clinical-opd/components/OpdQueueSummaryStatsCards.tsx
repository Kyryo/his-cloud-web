"use client";

import { Skeleton } from "@/components/ui/skeleton";
import type { OpdQueueSummaryStats } from "@/features/clinical-opd/utils/opd-queue-stats";
import { formatCompactNumber } from "@/utils/format-compact-number";

type OpdQueueSummaryStatsCardsProps = {
  stats: OpdQueueSummaryStats | null;
  isLoading?: boolean;
};

export function OpdQueueSummaryStatsCards({
  stats,
  isLoading = false,
}: OpdQueueSummaryStatsCardsProps) {
  if (isLoading) {
    return (
      <div
        className="grid grid-cols-2 divide-y divide-dash-border/60 border-y border-dash-border/80 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x"
        data-testid="opd-queue-summary-stats"
        aria-busy="true"
      >
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="px-3.5 py-3 sm:px-4 sm:py-3.5">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="mt-2.5 h-8 w-16" />
            <Skeleton className="mt-1.5 h-3 w-28" />
          </div>
        ))}
      </div>
    );
  }

  const totalCount = stats?.total ?? 0;
  const waitingCount = stats?.waiting ?? 0;
  const inProgressCount = stats?.in_progress ?? 0;
  const completedCount = stats?.completed ?? 0;

  return (
    <dl
      className="grid grid-cols-2 divide-y divide-dash-border/60 border-y border-dash-border/80 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x"
      data-testid="opd-queue-summary-stats"
    >
      <div className="px-3.5 py-3 transition-colors hover:bg-dash-canvas/40 sm:px-4 sm:py-3.5">
        <div className="flex items-center gap-2">
          <span className="size-2 shrink-0 rounded-full bg-brand-primary" />
          <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-dash-muted">
            Total encounters
          </dt>
        </div>
        <dd className="mt-1.5 text-2xl font-bold tracking-tight text-brand-navy tabular-nums sm:text-3xl">
          {formatCompactNumber(totalCount)}
        </dd>
        <p className="mt-0.5 text-xs text-brand-muted">Active OPD queue</p>
      </div>

      <div className="px-3.5 py-3 transition-colors hover:bg-dash-canvas/40 sm:px-4 sm:py-3.5">
        <div className="flex items-center gap-2">
          <span className="size-2 shrink-0 rounded-full bg-slate-400" />
          <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-dash-muted">
            Waiting
          </dt>
        </div>
        <dd className="mt-1.5 text-2xl font-bold tracking-tight text-brand-navy tabular-nums sm:text-3xl">
          {formatCompactNumber(waitingCount)}
        </dd>
        <p className="mt-0.5 text-xs text-brand-muted">Awaiting clinical review</p>
      </div>

      <div className="px-3.5 py-3 transition-colors hover:bg-dash-canvas/40 sm:px-4 sm:py-3.5">
        <div className="flex items-center gap-2">
          {inProgressCount > 0 ? (
            <span className="relative flex size-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-amber-500" />
            </span>
          ) : (
            <span className="size-2 shrink-0 rounded-full bg-amber-500" />
          )}
          <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-dash-muted">
            In progress
          </dt>
        </div>
        <dd className="mt-1.5 text-2xl font-bold tracking-tight text-brand-navy tabular-nums sm:text-3xl">
          {formatCompactNumber(inProgressCount)}
        </dd>
        <p className="mt-0.5 text-xs text-brand-muted">
          {inProgressCount > 0 ? (
            <span className="font-medium text-amber-700">Currently being seen</span>
          ) : (
            "Active consultations"
          )}
        </p>
      </div>

      <div className="px-3.5 py-3 transition-colors hover:bg-dash-canvas/40 sm:px-4 sm:py-3.5">
        <div className="flex items-center gap-2">
          <span className="size-2 shrink-0 rounded-full bg-emerald-500" />
          <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-dash-muted">
            Completed
          </dt>
        </div>
        <dd className="mt-1.5 text-2xl font-bold tracking-tight text-brand-navy tabular-nums sm:text-3xl">
          {formatCompactNumber(completedCount)}
        </dd>
        <p className="mt-0.5 text-xs text-brand-muted">Finished today</p>
      </div>
    </dl>
  );
}
