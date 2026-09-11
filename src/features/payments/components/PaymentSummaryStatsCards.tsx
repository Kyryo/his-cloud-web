"use client";

import { Skeleton } from "@/components/ui/skeleton";
import type { PaymentSummaryStats } from "@/features/payments/types/payment.types";
import { formatPaymentAmount } from "@/features/payments/utils/format-payment";
import {
  formatCompactAmount,
  formatCompactNumber,
} from "@/utils/format-compact-number";

type PaymentSummaryStatsCardsProps = {
  stats: PaymentSummaryStats | null;
  isLoading?: boolean;
};

const EMPTY_BUCKET = { count: 0, total: "0" };

export function PaymentSummaryStatsCards({
  stats,
  isLoading = false,
}: PaymentSummaryStatsCardsProps) {
  if (isLoading) {
    return (
      <div
        className="grid grid-cols-2 divide-y divide-dash-border/60 border-y border-dash-border/80 py-2 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x"
        data-testid="payment-summary-stats"
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
    posted: EMPTY_BUCKET,
    draft: EMPTY_BUCKET,
    cancelled: EMPTY_BUCKET,
  };

  return (
    <dl
      className="grid grid-cols-2 divide-y divide-dash-border/60 border-y border-dash-border/80 py-2 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x"
      data-testid="payment-summary-stats"
    >
      <div className="p-3.5 transition-colors hover:bg-dash-canvas/40 sm:p-4">
        <div className="flex items-center gap-2">
          <span className="size-2 shrink-0 rounded-full bg-blue-500" />
          <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-dash-muted">
            All payments
          </dt>
        </div>
        <dd className="mt-1 text-lg font-semibold tracking-tight text-brand-navy tabular-nums">
          {formatCompactNumber(buckets.all.count)}
        </dd>
        <p
          className="mt-0.5 text-xs text-brand-muted"
          title={formatPaymentAmount(buckets.all.total)}
        >
          {formatCompactAmount(buckets.all.total)} MWK · Total received
        </p>
      </div>

      <div className="p-3.5 transition-colors hover:bg-dash-canvas/40 sm:p-4">
        <div className="flex items-center gap-2">
          <span className="size-2 shrink-0 rounded-full bg-emerald-500" />
          <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-dash-muted">
            Posted
          </dt>
        </div>
        <dd className="mt-1 text-lg font-semibold tracking-tight text-brand-navy tabular-nums">
          {formatCompactNumber(buckets.posted.count)}
        </dd>
        <p
          className="mt-0.5 text-xs text-brand-muted"
          title={formatPaymentAmount(buckets.posted.total)}
        >
          <span className="font-medium text-emerald-700">
            {formatCompactAmount(buckets.posted.total)} MWK
          </span>{" "}
          · Confirmed
        </p>
      </div>

      <div className="p-3.5 transition-colors hover:bg-dash-canvas/40 sm:p-4">
        <div className="flex items-center gap-2">
          <span className="size-2 shrink-0 rounded-full bg-amber-500" />
          <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-dash-muted">
            Draft
          </dt>
        </div>
        <dd className="mt-1 text-lg font-semibold tracking-tight text-brand-navy tabular-nums">
          {formatCompactNumber(buckets.draft.count)}
        </dd>
        <p
          className="mt-0.5 text-xs text-brand-muted"
          title={formatPaymentAmount(buckets.draft.total)}
        >
          {formatCompactAmount(buckets.draft.total)} MWK · Pending
        </p>
      </div>

      <div className="p-3.5 transition-colors hover:bg-dash-canvas/40 sm:p-4">
        <div className="flex items-center gap-2">
          <span className="size-2 shrink-0 rounded-full bg-slate-400" />
          <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-dash-muted">
            Cancelled
          </dt>
        </div>
        <dd className="mt-1 text-lg font-semibold tracking-tight text-brand-navy tabular-nums">
          {formatCompactNumber(buckets.cancelled.count)}
        </dd>
        <p
          className="mt-0.5 text-xs text-brand-muted"
          title={formatPaymentAmount(buckets.cancelled.total)}
        >
          {formatCompactAmount(buckets.cancelled.total)} MWK · Voided
        </p>
      </div>
    </dl>
  );
}
