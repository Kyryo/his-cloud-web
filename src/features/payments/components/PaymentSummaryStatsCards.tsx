"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  LIST_PAGE_INSIGHT_CELL_CLASS,
  LIST_PAGE_INSIGHT_LABEL_CLASS,
  LIST_PAGE_INSIGHT_STRIP_CLASS,
  LIST_PAGE_INSIGHT_VALUE_CLASS,
} from "@/features/app-shell/components/page-layout";
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
        className={LIST_PAGE_INSIGHT_STRIP_CLASS}
        data-testid="payment-summary-stats"
        aria-busy="true"
      >
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className={LIST_PAGE_INSIGHT_CELL_CLASS}>
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="mt-2 h-6 w-14" />
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
      className={LIST_PAGE_INSIGHT_STRIP_CLASS}
      data-testid="payment-summary-stats"
    >
      <div className={LIST_PAGE_INSIGHT_CELL_CLASS}>
        <dt className={LIST_PAGE_INSIGHT_LABEL_CLASS}>All payments</dt>
        <dd className={LIST_PAGE_INSIGHT_VALUE_CLASS}>
          {formatCompactNumber(buckets.all.count)}
        </dd>
        <p
          className="mt-0.5 text-xs text-brand-muted"
          title={formatPaymentAmount(buckets.all.total)}
        >
          {formatCompactAmount(buckets.all.total)} MWK · Total received
        </p>
      </div>

      <div className={LIST_PAGE_INSIGHT_CELL_CLASS}>
        <dt className={LIST_PAGE_INSIGHT_LABEL_CLASS}>Posted</dt>
        <dd className={LIST_PAGE_INSIGHT_VALUE_CLASS}>
          {formatCompactNumber(buckets.posted.count)}
        </dd>
        <p
          className="mt-0.5 text-xs text-brand-muted"
          title={formatPaymentAmount(buckets.posted.total)}
        >
          {formatCompactAmount(buckets.posted.total)} MWK · Confirmed
        </p>
      </div>

      <div className={LIST_PAGE_INSIGHT_CELL_CLASS}>
        <dt className={LIST_PAGE_INSIGHT_LABEL_CLASS}>Draft</dt>
        <dd className={LIST_PAGE_INSIGHT_VALUE_CLASS}>
          {formatCompactNumber(buckets.draft.count)}
        </dd>
        <p
          className="mt-0.5 text-xs text-brand-muted"
          title={formatPaymentAmount(buckets.draft.total)}
        >
          {formatCompactAmount(buckets.draft.total)} MWK · Pending
        </p>
      </div>

      <div className={LIST_PAGE_INSIGHT_CELL_CLASS}>
        <dt className={LIST_PAGE_INSIGHT_LABEL_CLASS}>Cancelled</dt>
        <dd className={LIST_PAGE_INSIGHT_VALUE_CLASS}>
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
