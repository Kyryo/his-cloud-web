"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  LIST_PAGE_INSIGHT_CELL_CLASS,
  LIST_PAGE_INSIGHT_LABEL_CLASS,
  LIST_PAGE_INSIGHT_STRIP_CLASS,
  LIST_PAGE_INSIGHT_VALUE_CLASS,
} from "@/features/app-shell/components/page-layout";
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
        className={LIST_PAGE_INSIGHT_STRIP_CLASS}
        data-testid="invoice-summary-stats"
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
    paid: EMPTY_BUCKET,
    not_paid: EMPTY_BUCKET,
    partially_paid: EMPTY_BUCKET,
  };

  return (
    <dl
      className={LIST_PAGE_INSIGHT_STRIP_CLASS}
      data-testid="invoice-summary-stats"
    >
      <div className={LIST_PAGE_INSIGHT_CELL_CLASS}>
        <dt className={LIST_PAGE_INSIGHT_LABEL_CLASS}>All invoices</dt>
        <dd className={LIST_PAGE_INSIGHT_VALUE_CLASS}>
          {formatCompactNumber(buckets.all.count)}
        </dd>
        <p
          className="mt-0.5 text-xs text-brand-muted"
          title={formatInvoiceAmount(buckets.all.total)}
        >
          {formatCompactAmount(buckets.all.total)} MWK · Total billed
        </p>
      </div>

      <div className={LIST_PAGE_INSIGHT_CELL_CLASS}>
        <dt className={LIST_PAGE_INSIGHT_LABEL_CLASS}>Paid</dt>
        <dd className={LIST_PAGE_INSIGHT_VALUE_CLASS}>
          {formatCompactNumber(buckets.paid.count)}
        </dd>
        <p
          className="mt-0.5 text-xs text-brand-muted"
          title={formatInvoiceAmount(buckets.paid.total)}
        >
          {formatCompactAmount(buckets.paid.total)} MWK · Settled
        </p>
      </div>

      <div className={LIST_PAGE_INSIGHT_CELL_CLASS}>
        <dt className={LIST_PAGE_INSIGHT_LABEL_CLASS}>Unpaid</dt>
        <dd className={LIST_PAGE_INSIGHT_VALUE_CLASS}>
          {formatCompactNumber(buckets.not_paid.count)}
        </dd>
        <p
          className="mt-0.5 text-xs text-brand-muted"
          title={formatInvoiceAmount(buckets.not_paid.total)}
        >
          {formatCompactAmount(buckets.not_paid.total)} MWK · Outstanding
        </p>
      </div>

      <div className={LIST_PAGE_INSIGHT_CELL_CLASS}>
        <dt className={LIST_PAGE_INSIGHT_LABEL_CLASS}>Partially paid</dt>
        <dd className={LIST_PAGE_INSIGHT_VALUE_CLASS}>
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
