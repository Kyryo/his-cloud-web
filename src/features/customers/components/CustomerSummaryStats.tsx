"use client";

import { StatsCard1, StatsCard1Grid } from "@/components/stats-card1";
import { formatCompactNumber } from "@/utils/format-compact-number";
import type { CustomerSummaryStats } from "@/features/customers/utils/customer-stats";
import { formatGenderCounts } from "@/features/customers/utils/customer-stats";

type CustomerSummaryStatsProps = {
  stats: CustomerSummaryStats | null;
  isLoading?: boolean;
};

function StatValue({
  value,
  isLoading,
}: {
  value: string;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return <span className="text-brand-muted">—</span>;
  }

  return <>{value}</>;
}

function percentOfTotal(part: number, total: number): number | undefined {
  if (total <= 0) {
    return undefined;
  }

  return Math.round((part / total) * 100);
}

export function CustomerSummaryStats({
  stats,
  isLoading = false,
}: CustomerSummaryStatsProps) {
  const totalClients = stats?.totalClients ?? 0;
  const newThisMonth = stats?.newThisMonth ?? 0;

  return (
    <StatsCard1Grid data-testid="customer-summary-stats">
      <StatsCard1
        title="Total clients"
        value={
          <StatValue
            isLoading={isLoading}
            value={formatCompactNumber(totalClients)}
          />
        }
      />
      <StatsCard1
        title="New this month"
        value={
          <StatValue
            isLoading={isLoading}
            value={formatCompactNumber(newThisMonth)}
          />
        }
        change={
          !isLoading && stats
            ? percentOfTotal(newThisMonth, totalClients)
            : undefined
        }
        changeLabel="of total clients"
      />
      <StatsCard1
        title="Male / Female"
        value={
          <StatValue
            isLoading={isLoading}
            value={stats ? formatGenderCounts(stats) : "—"}
          />
        }
      />
      <StatsCard1
        title="Average age"
        value={
          <StatValue
            isLoading={isLoading}
            value={stats ? `${stats.averageAge} yrs` : "—"}
          />
        }
      />
    </StatsCard1Grid>
  );
}
