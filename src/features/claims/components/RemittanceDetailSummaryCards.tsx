"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  LIST_PAGE_INSIGHT_CELL_CLASS,
  LIST_PAGE_INSIGHT_LABEL_CLASS,
  LIST_PAGE_INSIGHT_STRIP_CLASS,
  LIST_PAGE_INSIGHT_VALUE_CLASS,
} from "@/features/app-shell/components/page-layout";
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
        className={LIST_PAGE_INSIGHT_STRIP_CLASS}
        data-testid="remittance-detail-summary-stats"
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
    claimed: EMPTY_BUCKET,
    pay_to_provider: EMPTY_BUCKET,
    matched: EMPTY_BUCKET,
    needs_action: EMPTY_BUCKET,
  };

  return (
    <dl
      className={LIST_PAGE_INSIGHT_STRIP_CLASS}
      data-testid="remittance-detail-summary-stats"
    >
      <div className={LIST_PAGE_INSIGHT_CELL_CLASS}>
        <dt className={LIST_PAGE_INSIGHT_LABEL_CLASS}>Claimed amount</dt>
        <dd className={LIST_PAGE_INSIGHT_VALUE_CLASS}>
          {formatCompactNumber(buckets.claimed.count)}
        </dd>
        <p
          className="mt-0.5 text-xs text-brand-muted"
          title={formatSalesOrderAmount(buckets.claimed.total, "MWK")}
        >
          {formatCompactAmount(buckets.claimed.total)} MWK · Line items
        </p>
      </div>

      <div className={LIST_PAGE_INSIGHT_CELL_CLASS}>
        <dt className={LIST_PAGE_INSIGHT_LABEL_CLASS}>Pay to you</dt>
        <dd className={LIST_PAGE_INSIGHT_VALUE_CLASS}>
          {formatCompactNumber(buckets.pay_to_provider.count)}
        </dd>
        <p
          className="mt-0.5 text-xs text-brand-muted"
          title={formatSalesOrderAmount(buckets.pay_to_provider.total, "MWK")}
        >
          {formatCompactAmount(buckets.pay_to_provider.total)} MWK · Provider share
        </p>
      </div>

      <div className={LIST_PAGE_INSIGHT_CELL_CLASS}>
        <dt className={LIST_PAGE_INSIGHT_LABEL_CLASS}>Matched lines</dt>
        <dd className={LIST_PAGE_INSIGHT_VALUE_CLASS}>
          {formatCompactNumber(buckets.matched.count)}
        </dd>
        <p
          className="mt-0.5 text-xs text-brand-muted"
          title={formatSalesOrderAmount(buckets.matched.total, "MWK")}
        >
          {formatCompactAmount(buckets.matched.total)} MWK · Linked claims
        </p>
      </div>

      <div className={LIST_PAGE_INSIGHT_CELL_CLASS}>
        <dt className={LIST_PAGE_INSIGHT_LABEL_CLASS}>Needs action</dt>
        <dd className={LIST_PAGE_INSIGHT_VALUE_CLASS}>
          {formatCompactNumber(buckets.needs_action.count)}
        </dd>
        <p
          className="mt-0.5 text-xs text-brand-muted"
          title={formatSalesOrderAmount(buckets.needs_action.total, "MWK")}
        >
          {formatCompactAmount(buckets.needs_action.total)} MWK · Review
        </p>
      </div>
    </dl>
  );
}
