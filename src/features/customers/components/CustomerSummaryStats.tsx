"use client";

import { StatsCard1, StatsCard1Grid } from "@/components/stats-card1";
import type { CustomerSummaryStats } from "@/features/customers/utils/customer-stats";
import { formatGenderCounts } from "@/features/customers/utils/customer-stats";
import { formatCompactNumber } from "@/utils/format-compact-number";

type CustomerSummaryStatsProps = {
  stats: CustomerSummaryStats | null;
  isLoading?: boolean;
};

function percentOfTotal(part: number, total: number): number | undefined {
  if (total <= 0) {
    return undefined;
  }

  return Math.round((part / total) * 100);
}

export function CustomerSummaryStatsCards({
  stats,
  isLoading = false,
}: CustomerSummaryStatsProps) {
  const totalClients = stats?.totalClients ?? 0;
  const newThisMonth = stats?.newThisMonth ?? 0;

  return (
    <StatsCard1Grid data-testid="customer-summary-stats">
      <StatsCard1
        title="Total clients"
        icon="users"
        tone="teal"
        isLoading={isLoading}
        value={formatCompactNumber(totalClients)}
      />
      <StatsCard1
        title="New this month"
        icon="add"
        tone="violet"
        isLoading={isLoading}
        value={formatCompactNumber(newThisMonth)}
        change={
          !isLoading && stats
            ? percentOfTotal(newThisMonth, totalClients)
            : undefined
        }
        changeLabel="of total clients"
      />
      <StatsCard1
        title="Male / Female"
        icon="user"
        tone="rose"
        isLoading={isLoading}
        value={stats ? formatGenderCounts(stats) : "—"}
      />
      <StatsCard1
        title="Average age"
        icon="activity"
        tone="navy"
        isLoading={isLoading}
        value={stats ? `${stats.averageAge} yrs` : "—"}
      />
    </StatsCard1Grid>
  );
}

/** @deprecated Use {@link CustomerSummaryStatsCards} */
export const CustomerSummaryStats = CustomerSummaryStatsCards;
