"use client";

import { Skeleton } from "@/components/ui/skeleton";
import type { ClaimSummaryStats } from "@/features/claims/types/claims.types";
import { formatSalesOrderAmount } from "@/features/sales-orders/utils/format-sales-order";
import {
  formatCompactAmount,
  formatCompactNumber,
} from "@/utils/format-compact-number";

type ClaimSummaryStatsCardsProps = {
  stats: ClaimSummaryStats | null;
  isLoading?: boolean;
};

const EMPTY_BUCKET = { count: 0, total: "0" };

export function ClaimSummaryStatsCards({
  stats,
  isLoading = false,
}: ClaimSummaryStatsCardsProps) {
  if (isLoading) {
    return (
      <div
        className="grid grid-cols-2 divide-y divide-dash-border/60 border-y border-dash-border/80 py-2 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x"
        data-testid="claim-summary-stats"
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
    draft: EMPTY_BUCKET,
    submitted: EMPTY_BUCKET,
    approved: EMPTY_BUCKET,
  };

  return (
    <dl
      className="grid grid-cols-2 divide-y divide-dash-border/60 border-y border-dash-border/80 py-2 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x"
      data-testid="claim-summary-stats"
    >
      <div className="p-3.5 transition-colors hover:bg-dash-canvas/40 sm:p-4">
        <div className="flex items-center gap-2">
          <span className="size-2 shrink-0 rounded-full bg-blue-500" />
          <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-dash-muted">
            All claims
          </dt>
        </div>
        <dd className="mt-1.5 text-2xl font-bold tracking-tight text-brand-navy tabular-nums sm:text-3xl">
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
            Draft
          </dt>
        </div>
        <dd className="mt-1.5 text-2xl font-bold tracking-tight text-brand-navy tabular-nums sm:text-3xl">
          {formatCompactNumber(buckets.draft.count)}
        </dd>
        <p
          className="mt-0.5 text-xs text-brand-muted"
          title={formatSalesOrderAmount(buckets.draft.total, "MWK")}
        >
          {formatCompactAmount(buckets.draft.total)} MWK · Not submitted
        </p>
      </div>

      <div className="p-3.5 transition-colors hover:bg-dash-canvas/40 sm:p-4">
        <div className="flex items-center gap-2">
          <span className="size-2 shrink-0 rounded-full bg-violet-500" />
          <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-dash-muted">
            Submitted
          </dt>
        </div>
        <dd className="mt-1.5 text-2xl font-bold tracking-tight text-brand-navy tabular-nums sm:text-3xl">
          {formatCompactNumber(buckets.submitted.count)}
        </dd>
        <p
          className="mt-0.5 text-xs text-brand-muted"
          title={formatSalesOrderAmount(buckets.submitted.total, "MWK")}
        >
          {formatCompactAmount(buckets.submitted.total)} MWK · With payer
        </p>
      </div>

      <div className="p-3.5 transition-colors hover:bg-dash-canvas/40 sm:p-4">
        <div className="flex items-center gap-2">
          <span className="size-2 shrink-0 rounded-full bg-emerald-500" />
          <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-dash-muted">
            Approved
          </dt>
        </div>
        <dd className="mt-1.5 text-2xl font-bold tracking-tight text-brand-navy tabular-nums sm:text-3xl">
          {formatCompactNumber(buckets.approved.count)}
        </dd>
        <p
          className="mt-0.5 text-xs text-brand-muted"
          title={formatSalesOrderAmount(buckets.approved.total, "MWK")}
        >
          <span className="font-medium text-emerald-700">
            {formatCompactAmount(buckets.approved.total)} MWK
          </span>{" "}
          · Accepted
        </p>
      </div>
    </dl>
  );
}
