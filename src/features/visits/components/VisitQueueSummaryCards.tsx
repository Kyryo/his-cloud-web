"use client";

import { StatsCard1, StatsCard1Grid } from "@/components/stats-card1";
import type { VisitQueueSummary } from "@/features/visits/types/visit.types";
import { formatCompactNumber } from "@/utils/format-compact-number";

type VisitQueueSummaryCardsProps = {
  stats: VisitQueueSummary | null;
  isLoading?: boolean;
};

export function VisitQueueSummaryCards({
  stats,
  isLoading = false,
}: VisitQueueSummaryCardsProps) {
  return (
    <StatsCard1Grid data-testid="visit-queue-summary-stats">
      <StatsCard1
        title="Today's visits"
        icon="calendar"
        tone="teal"
        isLoading={isLoading}
        value={formatCompactNumber(stats?.todays_visits ?? 0)}
      />
      <StatsCard1
        title="Today's active"
        icon="activity"
        tone="violet"
        isLoading={isLoading}
        value={formatCompactNumber(stats?.todays_active_visits ?? 0)}
      />
      <StatsCard1
        title="Today's completed"
        icon="clipboard"
        tone="navy"
        isLoading={isLoading}
        value={formatCompactNumber(stats?.todays_completed_visits ?? 0)}
      />
      <StatsCard1
        title="Total visits"
        icon="users"
        tone="rose"
        isLoading={isLoading}
        value={formatCompactNumber(stats?.total_visits ?? 0)}
      />
    </StatsCard1Grid>
  );
}
