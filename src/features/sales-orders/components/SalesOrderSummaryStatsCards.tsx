"use client";

import { StatsCard1, StatsCard1Grid } from "@/components/stats-card1";
import { ListPageCountAmountValue } from "@/features/app-shell/components/page-layout";
import type { SalesOrderSummaryStats } from "@/features/sales-orders/types/sales-order.types";

type SalesOrderSummaryStatsCardsProps = {
  stats: SalesOrderSummaryStats | null;
  isLoading?: boolean;
};

const EMPTY_BUCKET = { count: 0, total: "0" };

export function SalesOrderSummaryStatsCards({
  stats,
  isLoading = false,
}: SalesOrderSummaryStatsCardsProps) {
  const buckets = stats ?? {
    all: EMPTY_BUCKET,
    open: EMPTY_BUCKET,
    confirmed: EMPTY_BUCKET,
    cancelled: EMPTY_BUCKET,
  };

  return (
    <StatsCard1Grid data-testid="sales-order-summary-stats">
      <StatsCard1
        title="All orders"
        icon="clipboard"
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
        title="Open"
        icon="file"
        tone="amber"
        isLoading={isLoading}
        value={
          <ListPageCountAmountValue
            count={buckets.open.count}
            total={buckets.open.total}
          />
        }
      />
      <StatsCard1
        title="Confirmed"
        icon="invoice"
        tone="violet"
        isLoading={isLoading}
        value={
          <ListPageCountAmountValue
            count={buckets.confirmed.count}
            total={buckets.confirmed.total}
          />
        }
      />
      <StatsCard1
        title="Cancelled"
        icon="activity"
        tone="rose"
        isLoading={isLoading}
        value={
          <ListPageCountAmountValue
            count={buckets.cancelled.count}
            total={buckets.cancelled.total}
          />
        }
      />
    </StatsCard1Grid>
  );
}
