"use client";

import { Skeleton } from "@/components/ui/skeleton";
import type { SalesOrderSummaryStats } from "@/features/sales-orders/types/sales-order.types";
import { formatSalesOrderAmount } from "@/features/sales-orders/utils/format-sales-order";
import {
  formatCompactAmount,
  formatCompactNumber,
} from "@/utils/format-compact-number";

type SalesOrderSummaryStatsCardsProps = {
  stats: SalesOrderSummaryStats | null;
  isLoading?: boolean;
};

const EMPTY_BUCKET = { count: 0, total: "0" };

export function SalesOrderSummaryStatsCards({
  stats,
  isLoading = false,
}: SalesOrderSummaryStatsCardsProps) {
  if (isLoading) {
    return (
      <div
        className="grid grid-cols-2 divide-y divide-dash-border/60 border-y border-dash-border/80 py-2 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x"
        data-testid="sales-order-summary-stats"
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
    open: EMPTY_BUCKET,
    confirmed: EMPTY_BUCKET,
    cancelled: EMPTY_BUCKET,
  };

  return (
    <dl
      className="grid grid-cols-2 divide-y divide-dash-border/60 border-y border-dash-border/80 py-2 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x"
      data-testid="sales-order-summary-stats"
    >
      {/* 1. All orders */}
      <div className="p-3.5 transition-colors hover:bg-dash-canvas/40 sm:p-4">
        <div className="flex items-center gap-2">
          <span className="size-2 shrink-0 rounded-full bg-blue-500" />
          <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-dash-muted">
            All orders
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

      {/* 2. Open / Quotations */}
      <div className="p-3.5 transition-colors hover:bg-dash-canvas/40 sm:p-4">
        <div className="flex items-center gap-2">
          <span className="size-2 shrink-0 rounded-full bg-amber-500" />
          <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-dash-muted">
            Open
          </dt>
        </div>
        <dd className="mt-1.5 text-2xl font-bold tracking-tight text-brand-navy tabular-nums sm:text-3xl">
          {formatCompactNumber(buckets.open.count)}
        </dd>
        <p
          className="mt-0.5 text-xs text-brand-muted"
          title={formatSalesOrderAmount(buckets.open.total, "MWK")}
        >
          {formatCompactAmount(buckets.open.total)} MWK · Quotations & draft
        </p>
      </div>

      {/* 3. Confirmed */}
      <div className="p-3.5 transition-colors hover:bg-dash-canvas/40 sm:p-4">
        <div className="flex items-center gap-2">
          <span className="size-2 shrink-0 rounded-full bg-emerald-500" />
          <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-dash-muted">
            Confirmed
          </dt>
        </div>
        <dd className="mt-1.5 text-2xl font-bold tracking-tight text-brand-navy tabular-nums sm:text-3xl">
          {formatCompactNumber(buckets.confirmed.count)}
        </dd>
        <p
          className="mt-0.5 text-xs text-brand-muted"
          title={formatSalesOrderAmount(buckets.confirmed.total, "MWK")}
        >
          <span className="font-medium text-emerald-700">
            {formatCompactAmount(buckets.confirmed.total)} MWK
          </span>{" "}
          · Approved
        </p>
      </div>

      {/* 4. Cancelled */}
      <div className="p-3.5 transition-colors hover:bg-dash-canvas/40 sm:p-4">
        <div className="flex items-center gap-2">
          <span className="size-2 shrink-0 rounded-full bg-slate-400" />
          <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-dash-muted">
            Cancelled
          </dt>
        </div>
        <dd className="mt-1.5 text-2xl font-bold tracking-tight text-brand-navy tabular-nums sm:text-3xl">
          {formatCompactNumber(buckets.cancelled.count)}
        </dd>
        <p
          className="mt-0.5 text-xs text-brand-muted"
          title={formatSalesOrderAmount(buckets.cancelled.total, "MWK")}
        >
          {formatCompactAmount(buckets.cancelled.total)} MWK · Voided
        </p>
      </div>
    </dl>
  );
}
