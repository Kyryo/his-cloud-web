"use client";

import { StatsCard1, StatsCard1Grid } from "@/components/stats-card1";
import type { CustomerInvoicesStats } from "@/features/customers/types/customer-billing.types";
import { formatSalesOrderAmount } from "@/features/sales-orders/utils/format-sales-order";
import {
  formatCompactAmount,
  formatCompactNumber,
} from "@/utils/format-compact-number";

const STAT_CARD_CLASS = "border-brand-border bg-white shadow-none";

type CustomerInvoicePaymentStatsCardsProps = {
  stats: CustomerInvoicesStats | null;
  className?: string;
};

function formatStatCardValue(count: number, total: number | string) {
  const fullAmount = formatSalesOrderAmount(total, "MWK");

  return (
    <div className="space-y-0.5">
      <div title={`${count} items`}>{formatCompactNumber(count)}</div>
      <div
        className="text-xs font-normal text-muted-foreground"
        title={fullAmount}
      >
        {formatCompactAmount(total)} MWK
      </div>
    </div>
  );
}

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
    <StatsCard1Grid className={className}>
      <StatsCard1
        className={STAT_CARD_CLASS}
        title="All invoices"
        value={formatStatCardValue(buckets.all.count, buckets.all.total)}
      />
      <StatsCard1
        className={STAT_CARD_CLASS}
        title="Paid"
        value={formatStatCardValue(buckets.paid.count, buckets.paid.total)}
      />
      <StatsCard1
        className={STAT_CARD_CLASS}
        title="Unpaid"
        value={formatStatCardValue(buckets.not_paid.count, buckets.not_paid.total)}
      />
      <StatsCard1
        className={STAT_CARD_CLASS}
        title="Partially paid"
        value={formatStatCardValue(
          buckets.partially_paid.count,
          buckets.partially_paid.total,
        )}
      />
    </StatsCard1Grid>
  );
}
