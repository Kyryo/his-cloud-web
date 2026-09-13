"use client";

import {
  LIST_PAGE_INSIGHT_CELL_CLASS,
  LIST_PAGE_INSIGHT_LABEL_CLASS,
  LIST_PAGE_INSIGHT_VALUE_CLASS,
} from "@/features/app-shell/components/page-layout";
import type { CustomerInvoicesStats } from "@/features/customers/types/customer-billing.types";
import { formatSalesOrderAmount } from "@/features/sales-orders/utils/format-sales-order";
import {
  formatCompactAmount,
  formatCompactNumber,
} from "@/utils/format-compact-number";
import { cn } from "@/lib/utils";

type CustomerInvoicePaymentStatsCardsProps = {
  stats: CustomerInvoicesStats | null;
  className?: string;
};

export function CustomerInvoicePaymentStatsCards({
  stats,
  className,
}: CustomerInvoicePaymentStatsCardsProps) {
  const buckets = stats ?? {
    all: { count: 0, total: 0 },
    paid: { count: 0, total: 0 },
    not_paid: { count: 0, total: 0 },
    partially_paid: { count: 0, total: 0 },
  };

  return (
    <dl
      className={cn(
        "grid grid-cols-2 divide-y divide-dash-border/60 border-b border-dash-border/80 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x",
        className,
      )}
      data-testid="customer-invoice-payment-stats"
    >
      <div className={LIST_PAGE_INSIGHT_CELL_CLASS}>
        <dt className={LIST_PAGE_INSIGHT_LABEL_CLASS}>All invoices</dt>
        <dd className={LIST_PAGE_INSIGHT_VALUE_CLASS}>
          {formatCompactNumber(buckets.all.count)}
        </dd>
        <p
          className="mt-0.5 text-xs text-brand-muted"
          title={formatSalesOrderAmount(buckets.all.total, "MWK")}
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
          title={formatSalesOrderAmount(buckets.paid.total, "MWK")}
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
          title={formatSalesOrderAmount(buckets.not_paid.total, "MWK")}
        >
          {formatCompactAmount(buckets.not_paid.total)} MWK · Unpaid
        </p>
      </div>

      <div className={LIST_PAGE_INSIGHT_CELL_CLASS}>
        <dt className={LIST_PAGE_INSIGHT_LABEL_CLASS}>Partially paid</dt>
        <dd className={LIST_PAGE_INSIGHT_VALUE_CLASS}>
          {formatCompactNumber(buckets.partially_paid.count)}
        </dd>
        <p
          className="mt-0.5 text-xs text-brand-muted"
          title={formatSalesOrderAmount(buckets.partially_paid.total, "MWK")}
        >
          {formatCompactAmount(buckets.partially_paid.total)} MWK · Partial
        </p>
      </div>
    </dl>
  );
}
