"use client";

import { Skeleton } from "@/components/ui/skeleton";
import type { InvoiceSummaryStats } from "@/features/invoices/types/invoice.types";
import { formatInvoiceAmount } from "@/features/invoices/utils/format-invoice";
import {
  formatCompactAmount,
  formatCompactNumber,
} from "@/utils/format-compact-number";

type InvoiceSummaryStatsCardsProps = {
  stats: InvoiceSummaryStats | null;
  isLoading?: boolean;
};

const EMPTY_BUCKET = { count: 0, total: "0" };

export function InvoiceSummaryStatsCards({
  stats,
  isLoading = false,
}: InvoiceSummaryStatsCardsProps) {
  if (isLoading) {
    return (
      <div
        className="grid grid-cols-2 divide-y divide-dash-border/60 border-y border-dash-border/80 py-2 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x"
        data-testid="invoice-summary-stats"
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
    paid: EMPTY_BUCKET,
    not_paid: EMPTY_BUCKET,
    partially_paid: EMPTY_BUCKET,
  };

  return (
    <dl
      className="grid grid-cols-2 divide-y divide-dash-border/60 border-y border-dash-border/80 py-2 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x"
      data-testid="invoice-summary-stats"
    >
      <div className="p-3.5 transition-colors hover:bg-dash-canvas/40 sm:p-4">
        <div className="flex items-center gap-2">
          <span className="size-2 shrink-0 rounded-full bg-blue-500" />
          <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-dash-muted">
            All invoices
          </dt>
        </div>
        <dd className="mt-1.5 text-2xl font-bold tracking-tight text-brand-navy tabular-nums sm:text-3xl">
          {formatCompactNumber(buckets.all.count)}
        </dd>
        <p
          className="mt-0.5 text-xs text-brand-muted"
          title={formatInvoiceAmount(buckets.all.total)}
        >
          {formatCompactAmount(buckets.all.total)} MWK · Total billed
        </p>
      </div>

      <div className="p-3.5 transition-colors hover:bg-dash-canvas/40 sm:p-4">
        <div className="flex items-center gap-2">
          <span className="size-2 shrink-0 rounded-full bg-emerald-500" />
          <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-dash-muted">
            Paid
          </dt>
        </div>
        <dd className="mt-1.5 text-2xl font-bold tracking-tight text-brand-navy tabular-nums sm:text-3xl">
          {formatCompactNumber(buckets.paid.count)}
        </dd>
        <p
          className="mt-0.5 text-xs text-brand-muted"
          title={formatInvoiceAmount(buckets.paid.total)}
        >
          <span className="font-medium text-emerald-700">
            {formatCompactAmount(buckets.paid.total)} MWK
          </span>{" "}
          · Settled
        </p>
      </div>

      <div className="p-3.5 transition-colors hover:bg-dash-canvas/40 sm:p-4">
        <div className="flex items-center gap-2">
          {buckets.not_paid.count > 0 ? (
            <span className="relative flex size-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-rose-500" />
            </span>
          ) : (
            <span className="size-2 shrink-0 rounded-full bg-rose-500" />
          )}
          <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-dash-muted">
            Unpaid
          </dt>
        </div>
        <dd className="mt-1.5 text-2xl font-bold tracking-tight text-brand-navy tabular-nums sm:text-3xl">
          {formatCompactNumber(buckets.not_paid.count)}
        </dd>
        <p
          className="mt-0.5 text-xs text-brand-muted"
          title={formatInvoiceAmount(buckets.not_paid.total)}
        >
          {buckets.not_paid.count > 0 ? (
            <span className="font-medium text-rose-700">
              {formatCompactAmount(buckets.not_paid.total)} MWK · Outstanding
            </span>
          ) : (
            <>{formatCompactAmount(buckets.not_paid.total)} MWK · Outstanding</>
          )}
        </p>
      </div>

      <div className="p-3.5 transition-colors hover:bg-dash-canvas/40 sm:p-4">
        <div className="flex items-center gap-2">
          <span className="size-2 shrink-0 rounded-full bg-amber-500" />
          <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-dash-muted">
            Partially paid
          </dt>
        </div>
        <dd className="mt-1.5 text-2xl font-bold tracking-tight text-brand-navy tabular-nums sm:text-3xl">
          {formatCompactNumber(buckets.partially_paid.count)}
        </dd>
        <p
          className="mt-0.5 text-xs text-brand-muted"
          title={formatInvoiceAmount(buckets.partially_paid.total)}
        >
          {formatCompactAmount(buckets.partially_paid.total)} MWK · Partial
        </p>
      </div>
    </dl>
  );
}
