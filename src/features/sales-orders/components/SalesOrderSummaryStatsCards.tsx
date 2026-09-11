"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  LIST_PAGE_INSIGHT_CELL_CLASS,
  LIST_PAGE_INSIGHT_LABEL_CLASS,
  LIST_PAGE_INSIGHT_STRIP_CLASS,
  LIST_PAGE_INSIGHT_VALUE_CLASS,
} from "@/features/app-shell/components/page-layout";
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
        className={LIST_PAGE_INSIGHT_STRIP_CLASS}
        data-testid="sales-order-summary-stats"
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
    open: EMPTY_BUCKET,
    confirmed: EMPTY_BUCKET,
    cancelled: EMPTY_BUCKET,
  };

  return (
    <dl
      className={LIST_PAGE_INSIGHT_STRIP_CLASS}
      data-testid="sales-order-summary-stats"
    >
      <div className={LIST_PAGE_INSIGHT_CELL_CLASS}>
        <dt className={LIST_PAGE_INSIGHT_LABEL_CLASS}>
          All orders
        </dt>
        <dd className={LIST_PAGE_INSIGHT_VALUE_CLASS}>
          {formatCompactNumber(buckets.all.count)}
        </dd>
        <p
          className="mt-0.5 text-xs text-brand-muted"
          title={formatSalesOrderAmount(buckets.all.total, "MWK")}
        >
          {formatCompactAmount(buckets.all.total)} MWK total
        </p>
      </div>

      <div className={LIST_PAGE_INSIGHT_CELL_CLASS}>
        <dt className={LIST_PAGE_INSIGHT_LABEL_CLASS}>
          Open
        </dt>
        <dd className={LIST_PAGE_INSIGHT_VALUE_CLASS}>
          {formatCompactNumber(buckets.open.count)}
        </dd>
        <p
          className="mt-0.5 text-xs text-brand-muted"
          title={formatSalesOrderAmount(buckets.open.total, "MWK")}
        >
          {formatCompactAmount(buckets.open.total)} MWK quotations
        </p>
      </div>

      <div className={LIST_PAGE_INSIGHT_CELL_CLASS}>
        <dt className={LIST_PAGE_INSIGHT_LABEL_CLASS}>
          Confirmed
        </dt>
        <dd className={LIST_PAGE_INSIGHT_VALUE_CLASS}>
          {formatCompactNumber(buckets.confirmed.count)}
        </dd>
        <p
          className="mt-0.5 text-xs text-brand-muted"
          title={formatSalesOrderAmount(buckets.confirmed.total, "MWK")}
        >
          {formatCompactAmount(buckets.confirmed.total)} MWK approved
        </p>
      </div>

      <div className={LIST_PAGE_INSIGHT_CELL_CLASS}>
        <dt className={LIST_PAGE_INSIGHT_LABEL_CLASS}>
          Cancelled
        </dt>
        <dd className={LIST_PAGE_INSIGHT_VALUE_CLASS}>
          {formatCompactNumber(buckets.cancelled.count)}
        </dd>
        <p
          className="mt-0.5 text-xs text-brand-muted"
          title={formatSalesOrderAmount(buckets.cancelled.total, "MWK")}
        >
          {formatCompactAmount(buckets.cancelled.total)} MWK voided
        </p>
      </div>
    </dl>
  );
}
