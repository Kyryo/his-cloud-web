"use client";

import { StatsCard1, StatsCard1Grid } from "@/components/stats-card1";
import { ListPageCountAmountValue } from "@/features/app-shell/components/page-layout";
import type { RemittanceSummaryStats } from "@/features/claims/types/remittances.types";

type RemittanceSummaryStatsCardsProps = {
  stats: RemittanceSummaryStats | null;
  isLoading?: boolean;
};

const EMPTY_BUCKET = { count: 0, total: "0" };

export function RemittanceSummaryStatsCards({
  stats,
  isLoading = false,
}: RemittanceSummaryStatsCardsProps) {
  const buckets = stats ?? {
    all: EMPTY_BUCKET,
    in_progress: EMPTY_BUCKET,
    processed: EMPTY_BUCKET,
    needs_review: EMPTY_BUCKET,
  };

  return (
    <StatsCard1Grid data-testid="remittance-summary-stats">
      <StatsCard1
        title="All remittances"
        icon="shield"
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
        title="In progress"
        icon="transfer"
        tone="amber"
        isLoading={isLoading}
        value={
          <ListPageCountAmountValue
            count={buckets.in_progress.count}
            total={buckets.in_progress.total}
          />
        }
      />
      <StatsCard1
        title="Processed"
        icon="wallet"
        tone="violet"
        isLoading={isLoading}
        value={
          <ListPageCountAmountValue
            count={buckets.processed.count}
            total={buckets.processed.total}
          />
        }
      />
      <StatsCard1
        title="Needs review"
        icon="clipboard"
        tone="rose"
        isLoading={isLoading}
        value={
          <ListPageCountAmountValue
            count={buckets.needs_review.count}
            total={buckets.needs_review.total}
          />
        }
      />
    </StatsCard1Grid>
  );
}
