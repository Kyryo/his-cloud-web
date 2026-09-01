"use client";

import { StatsCard1, StatsCard1Grid } from "@/components/stats-card1";
import { ListPageCountAmountValue } from "@/features/app-shell/components/page-layout";
import type { ClaimSummaryStats } from "@/features/claims/types/claims.types";

type ClaimSummaryStatsCardsProps = {
  stats: ClaimSummaryStats | null;
  isLoading?: boolean;
};

const EMPTY_BUCKET = { count: 0, total: "0" };

export function ClaimSummaryStatsCards({
  stats,
  isLoading = false,
}: ClaimSummaryStatsCardsProps) {
  const buckets = stats ?? {
    all: EMPTY_BUCKET,
    draft: EMPTY_BUCKET,
    submitted: EMPTY_BUCKET,
    approved: EMPTY_BUCKET,
  };

  return (
    <StatsCard1Grid data-testid="claim-summary-stats">
      <StatsCard1
        title="All claims"
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
        title="Submitted"
        icon="transfer"
        tone="violet"
        isLoading={isLoading}
        value={
          <ListPageCountAmountValue
            count={buckets.submitted.count}
            total={buckets.submitted.total}
          />
        }
      />
      <StatsCard1
        title="Approved"
        icon="wallet"
        tone="teal"
        isLoading={isLoading}
        value={
          <ListPageCountAmountValue
            count={buckets.approved.count}
            total={buckets.approved.total}
          />
        }
      />
    </StatsCard1Grid>
  );
}
