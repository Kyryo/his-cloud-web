"use client";

import { StatsCard1, StatsCard1Grid } from "@/components/stats-card1";
import { ListPageCountAmountValue } from "@/features/app-shell/components/page-layout";
import type { PaymentSummaryStats } from "@/features/payments/types/payment.types";

type PaymentSummaryStatsCardsProps = {
  stats: PaymentSummaryStats | null;
  isLoading?: boolean;
};

const EMPTY_BUCKET = { count: 0, total: "0" };

export function PaymentSummaryStatsCards({
  stats,
  isLoading = false,
}: PaymentSummaryStatsCardsProps) {
  const buckets = stats ?? {
    all: EMPTY_BUCKET,
    posted: EMPTY_BUCKET,
    draft: EMPTY_BUCKET,
    cancelled: EMPTY_BUCKET,
  };

  return (
    <StatsCard1Grid data-testid="payment-summary-stats">
      <StatsCard1
        title="All payments"
        icon="wallet"
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
        title="Posted"
        icon="creditCard"
        tone="violet"
        isLoading={isLoading}
        value={
          <ListPageCountAmountValue
            count={buckets.posted.count}
            total={buckets.posted.total}
          />
        }
      />
      <StatsCard1
        title="Draft"
        icon="file"
        tone="amber"
        isLoading={isLoading}
        value={
          <ListPageCountAmountValue
            count={buckets.draft.count}
            total={buckets.draft.total}
          />
        }
      />
      <StatsCard1
        title="Cancelled"
        icon="clipboard"
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
