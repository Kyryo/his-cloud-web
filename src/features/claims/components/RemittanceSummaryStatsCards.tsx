"use client";

import { Skeleton } from "@/components/ui/skeleton";
import type { RemittanceSummaryStats } from "@/features/claims/types/remittances.types";
import { formatSalesOrderAmount } from "@/features/sales-orders/utils/format-sales-order";
import {
  formatCompactAmount,
  formatCompactNumber,
} from "@/utils/format-compact-number";

type RemittanceSummaryStatsCardsProps = {
  stats: RemittanceSummaryStats | null;
  isLoading?: boolean;
};

const EMPTY_BUCKET = { count: 0, total: "0" };

export function RemittanceSummaryStatsCards({
  stats,
  isLoading = false,
}: RemittanceSummaryStatsCardsProps) {
  if (isLoading) {
    return (
      <div
        className="grid grid-cols-2 divide-y divide-dash-border/60 border-y border-dash-border/80 py-2 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x"
        data-testid="remittance-summary-stats"
        aria-busy="true"
      >
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="p-3.5 sm:p-4">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="mt-2.5 h-8 w-16" />
            <Skeleton className="mt-1.5 h-3 w-28" />
          </div>
        ))}
      </div>
    );
  }

  const buckets = stats ?? {
    all: EMPTY_BUCKET,
    in_progress: EMPTY_BUCKET,
    processed: EMPTY_BUCKET,
    needs_review: EMPTY_BUCKET,
  };

  return (
    <dl
      className="grid grid-cols-2 divide-y divide-dash-border/60 border-y border-dash-border/80 py-2 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x"
      data-testid="remittance-summary-stats"
    >
      <div className="p-3.5 transition-colors hover:bg-dash-canvas/40 sm:p-4">
        <div className="flex items-center gap-2">
          <span className="size-2 shrink-0 rounded-full bg-blue-500" />
          <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-dash-muted">
            All remittances
          </dt>
        </div>
        <dd className="mt-1 text-lg font-semibold tracking-tight text-brand-navy tabular-nums">
          {formatCompactNumber(buckets.all.count)}
        </dd>
        <p
          className="mt-0.5 text-xs text-brand-muted"
          title={formatSalesOrderAmount(buckets.all.total, "MWK")}
        >
          {formatCompactAmount(buckets.all.total)} MWK · Total volume
        </p>
      </div>

      <div className="p-3.5 transition-colors hover:bg-dash-canvas/40 sm:p-4">
        <div className="flex items-center gap-2">
          <span className="size-2 shrink-0 rounded-full bg-amber-500" />
          <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-dash-muted">
            In progress
          </dt>
        </div>
        <dd className="mt-1 text-lg font-semibold tracking-tight text-brand-navy tabular-nums">
          {formatCompactNumber(buckets.in_progress.count)}
        </dd>
        <p
          className="mt-0.5 text-xs text-brand-muted"
          title={formatSalesOrderAmount(buckets.in_progress.total, "MWK")}
        >
          {formatCompactAmount(buckets.in_progress.total)} MWK · Processing
        </p>
      </div>

      <div className="p-3.5 transition-colors hover:bg-dash-canvas/40 sm:p-4">
        <div className="flex items-center gap-2">
          <span className="size-2 shrink-0 rounded-full bg-emerald-500" />
          <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-dash-muted">
            Processed
          </dt>
        </div>
        <dd className="mt-1 text-lg font-semibold tracking-tight text-brand-navy tabular-nums">
          {formatCompactNumber(buckets.processed.count)}
        </dd>
        <p
          className="mt-0.5 text-xs text-brand-muted"
          title={formatSalesOrderAmount(buckets.processed.total, "MWK")}
        >
          <span className="font-medium text-emerald-700">
            {formatCompactAmount(buckets.processed.total)} MWK
          </span>{" "}
          · Settled
        </p>
      </div>

      <div className="p-3.5 transition-colors hover:bg-dash-canvas/40 sm:p-4">
        <div className="flex items-center gap-2">
          {buckets.needs_review.count > 0 ? (
            <span className="relative flex size-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-rose-500" />
            </span>
          ) : (
            <span className="size-2 shrink-0 rounded-full bg-rose-500" />
          )}
          <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-dash-muted">
            Needs review
          </dt>
        </div>
        <dd className="mt-1 text-lg font-semibold tracking-tight text-brand-navy tabular-nums">
          {formatCompactNumber(buckets.needs_review.count)}
        </dd>
        <p
          className="mt-0.5 text-xs text-brand-muted"
          title={formatSalesOrderAmount(buckets.needs_review.total, "MWK")}
        >
          {buckets.needs_review.count > 0 ? (
            <span className="font-medium text-rose-700">
              {formatCompactAmount(buckets.needs_review.total)} MWK · Attention
            </span>
          ) : (
            <>{formatCompactAmount(buckets.needs_review.total)} MWK · Attention</>
          )}
        </p>
      </div>
    </dl>
  );
}
