"use client";

import { StatsCard1, StatsCard1Grid } from "@/components/stats-card1";
import { ListPageCountAmountValue } from "@/features/app-shell/components/page-layout";
import type { InvoiceSummaryStats } from "@/features/invoices/types/invoice.types";

type InvoiceSummaryStatsCardsProps = {
  stats: InvoiceSummaryStats | null;
  isLoading?: boolean;
};

const EMPTY_BUCKET = { count: 0, total: "0" };

export function InvoiceSummaryStatsCards({
  stats,
  isLoading = false,
}: InvoiceSummaryStatsCardsProps) {
  const buckets = stats ?? {
    all: EMPTY_BUCKET,
    paid: EMPTY_BUCKET,
    not_paid: EMPTY_BUCKET,
    partially_paid: EMPTY_BUCKET,
  };

  return (
    <StatsCard1Grid data-testid="invoice-summary-stats">
      <StatsCard1
        title="All invoices"
        icon="invoice"
        tone="teal"
        isLoading={isLoading}
        value={
          <ListPageCountAmountValue
            count={buckets.all.count}
            total={buckets.all.total}
          />
        }
      />
      <StatsCard1
        title="Paid"
        icon="wallet"
        tone="violet"
        isLoading={isLoading}
        value={
          <ListPageCountAmountValue
            count={buckets.paid.count}
            total={buckets.paid.total}
          />
        }
      />
      <StatsCard1
        title="Unpaid"
        icon="creditCard"
        tone="rose"
        isLoading={isLoading}
        value={
          <ListPageCountAmountValue
            count={buckets.not_paid.count}
            total={buckets.not_paid.total}
          />
        }
      />
      <StatsCard1
        title="Partially paid"
        icon="analytics"
        tone="amber"
        isLoading={isLoading}
        value={
          <ListPageCountAmountValue
            count={buckets.partially_paid.count}
            total={buckets.partially_paid.total}
          />
        }
      />
    </StatsCard1Grid>
  );
}
