"use client";

import { StatsCard1, StatsCard1Grid } from "@/components/stats-card1";
import { ListPageCountAmountValue } from "@/features/app-shell/components/page-layout";
import type {
  RemittanceBatchRowStatsBucket,
  RemittanceBatchRowSummaryStats,
} from "@/features/claims/types/remittances.types";

type RemittanceDetailSummaryCardsProps = {
  stats: RemittanceBatchRowSummaryStats | null;
  isLoading?: boolean;
};

const EMPTY_BUCKET: RemittanceBatchRowStatsBucket = { count: 0, total: "0" };

export function RemittanceDetailSummaryCards({
  stats,
  isLoading = false,
}: RemittanceDetailSummaryCardsProps) {
  const buckets = stats ?? {
    claimed: EMPTY_BUCKET,
    pay_to_provider: EMPTY_BUCKET,
    matched: EMPTY_BUCKET,
    needs_action: EMPTY_BUCKET,
  };

  return (
    <StatsCard1Grid data-testid="remittance-detail-summary-stats">
      <StatsCard1
        title="Claimed amount"
        icon="clipboard"
        tone="violet"
        isLoading={isLoading}
        value={
          <ListPageCountAmountValue
            count={buckets.claimed.count}
            total={buckets.claimed.total}
          />
        }
      />
      <StatsCard1
        title="Pay to you"
        icon="wallet"
        tone="teal"
        isLoading={isLoading}
        value={
          <ListPageCountAmountValue
            count={buckets.pay_to_provider.count}
            total={buckets.pay_to_provider.total}
          />
        }
      />
      <StatsCard1
        title="Matched lines"
        icon="shield"
        tone="teal"
        isLoading={isLoading}
        value={
          <ListPageCountAmountValue
            count={buckets.matched.count}
            total={buckets.matched.total}
          />
        }
      />
      <StatsCard1
        title="Needs action"
        icon="transfer"
        tone="rose"
        isLoading={isLoading}
        value={
          <ListPageCountAmountValue
            count={buckets.needs_action.count}
            total={buckets.needs_action.total}
          />
        }
      />
    </StatsCard1Grid>
  );
}
