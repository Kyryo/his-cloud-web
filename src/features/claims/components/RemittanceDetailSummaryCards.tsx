"use client";

import { Skeleton } from "@/components/ui/skeleton";
import type {
  RemittanceBatchRowStatsBucket,
  RemittanceBatchRowSummaryStats,
} from "@/features/claims/types/remittances.types";
import { formatSalesOrderAmount } from "@/features/sales-orders/utils/format-sales-order";
import {
  formatCompactAmount,
  formatCompactNumber,
} from "@/utils/format-compact-number";

type RemittanceDetailSummaryCardsProps = {
  stats?: RemittanceBatchRowSummaryStats | null;
  isLoading?: boolean;
};

const EMPTY_BUCKET: RemittanceBatchRowStatsBucket = { count: 0, total: "0" };

export function RemittanceDetailSummaryCards({
  stats,
  isLoading = false,
}: RemittanceDetailSummaryCardsProps) {
  if (isLoading) {
    return (
      <div
        className="grid grid-cols-2 divide-y divide-dash-border/60 border-y border-dash-border/80 py-2 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x"
        data-testid="remittance-detail-summary-stats"
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
    claimed: EMPTY_BUCKET,
    pay_to_provider: EMPTY_BUCKET,
    matched: EMPTY_BUCKET,
    needs_action: EMPTY_BUCKET,
  };

  return (
    <dl
      className="grid grid-cols-2 divide-y divide-dash-border/60 border-y border-dash-border/80 py-2 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x"
      data-testid="remittance-detail-summary-stats"
    >
      <div className="p-3.5 transition-colors hover:bg-dash-canvas/40 sm:p-4">
        <div className="flex items-center gap-2">
          <span className="size-2 shrink-0 rounded-full bg-violet-500" />
          <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-dash-muted">
            Claimed amount
          </dt>
        </div>
        <dd className="mt-1 text-lg font-semibold tracking-tight text-brand-navy tabular-nums">
          {formatCompactNumber(buckets.claimed.count)}
        </dd>
        <p
          className="mt-0.5 text-xs text-brand-muted"
          title={formatSalesOrderAmount(buckets.claimed.total, "MWK")}
        >
          {formatCompactAmount(buckets.claimed.total)} MWK · Line items
        </p>
      </div>

      <div className="p-3.5 transition-colors hover:bg-dash-canvas/40 sm:p-4">
        <div className="flex items-center gap-2">
          <span className="size-2 shrink-0 rounded-full bg-emerald-500" />
          <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-dash-muted">
            Pay to you
          </dt>
        </div>
        <dd className="mt-1 text-lg font-semibold tracking-tight text-brand-navy tabular-nums">
          {formatCompactNumber(buckets.pay_to_provider.count)}
        </dd>
        <p
          className="mt-0.5 text-xs text-brand-muted"
          title={formatSalesOrderAmount(buckets.pay_to_provider.total, "MWK")}
        >
          <span className="font-medium text-emerald-700">
            {formatCompactAmount(buckets.pay_to_provider.total)} MWK
          </span>{" "}
          · Provider share
        </p>
      </div>

      <div className="p-3.5 transition-colors hover:bg-dash-canvas/40 sm:p-4">
        <div className="flex items-center gap-2">
          <span className="size-2 shrink-0 rounded-full bg-blue-500" />
          <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-dash-muted">
            Matched lines
          </dt>
        </div>
        <dd className="mt-1 text-lg font-semibold tracking-tight text-brand-navy tabular-nums">
          {formatCompactNumber(buckets.matched.count)}
        </dd>
        <p
          className="mt-0.5 text-xs text-brand-muted"
          title={formatSalesOrderAmount(buckets.matched.total, "MWK")}
        >
          {formatCompactAmount(buckets.matched.total)} MWK · Linked claims
        </p>
      </div>

      <div className="p-3.5 transition-colors hover:bg-dash-canvas/40 sm:p-4">
        <div className="flex items-center gap-2">
          {buckets.needs_action.count > 0 ? (
            <span className="relative flex size-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-rose-500" />
            </span>
          ) : (
            <span className="size-2 shrink-0 rounded-full bg-rose-500" />
          )}
          <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-dash-muted">
            Needs action
          </dt>
        </div>
        <dd className="mt-1 text-lg font-semibold tracking-tight text-brand-navy tabular-nums">
          {formatCompactNumber(buckets.needs_action.count)}
        </dd>
        <p
          className="mt-0.5 text-xs text-brand-muted"
          title={formatSalesOrderAmount(buckets.needs_action.total, "MWK")}
        >
          {buckets.needs_action.count > 0 ? (
            <span className="font-medium text-rose-700">
              {formatCompactAmount(buckets.needs_action.total)} MWK · Review
            </span>
          ) : (
            <>{formatCompactAmount(buckets.needs_action.total)} MWK · Review</>
          )}
        </p>
      </div>
    </dl>
  );
}
