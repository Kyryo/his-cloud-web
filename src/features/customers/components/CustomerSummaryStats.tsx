"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  LIST_PAGE_INSIGHT_CELL_CLASS,
  LIST_PAGE_INSIGHT_LABEL_CLASS,
  LIST_PAGE_INSIGHT_STRIP_CLASS,
  LIST_PAGE_INSIGHT_VALUE_CLASS,
} from "@/features/app-shell/components/page-layout";
import type { CustomerSummaryStats as CustomerSummaryStatsData } from "@/features/customers/utils/customer-stats";
import { formatGenderCounts } from "@/features/customers/utils/customer-stats";
import { formatCompactNumber } from "@/utils/format-compact-number";

type CustomerSummaryStatsProps = {
  stats: CustomerSummaryStatsData | null;
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
  const newPercentage = percentOfTotal(newThisMonth, totalClients);

  if (isLoading) {
    return (
      <div
        className={LIST_PAGE_INSIGHT_STRIP_CLASS}
        data-testid="customer-summary-stats"
        aria-busy="true"
      >
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className={LIST_PAGE_INSIGHT_CELL_CLASS}>
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="mt-2 h-6 w-14" />
            <Skeleton className="mt-1.5 h-3 w-28" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <dl
      className={LIST_PAGE_INSIGHT_STRIP_CLASS}
      data-testid="customer-summary-stats"
    >
      <div className={LIST_PAGE_INSIGHT_CELL_CLASS}>
        <dt className={LIST_PAGE_INSIGHT_LABEL_CLASS}>
          Total clients
        </dt>
        <dd className={LIST_PAGE_INSIGHT_VALUE_CLASS}>
          {formatCompactNumber(totalClients)}
        </dd>
        <p className="mt-0.5 text-xs text-brand-muted">Registered and active</p>
      </div>

      <div className={LIST_PAGE_INSIGHT_CELL_CLASS}>
        <dt className={LIST_PAGE_INSIGHT_LABEL_CLASS}>
          New this month
        </dt>
        <dd className={LIST_PAGE_INSIGHT_VALUE_CLASS}>
          {formatCompactNumber(newThisMonth)}
        </dd>
        <p className="mt-0.5 text-xs text-brand-muted">
          {newPercentage !== undefined
            ? `+${newPercentage}% of directory`
            : "Recent registrations"}
        </p>
      </div>

      <div className={LIST_PAGE_INSIGHT_CELL_CLASS}>
        <dt className={LIST_PAGE_INSIGHT_LABEL_CLASS}>
          Male / Female
        </dt>
        <dd className={LIST_PAGE_INSIGHT_VALUE_CLASS}>
          {stats ? formatGenderCounts(stats) : "-"}
        </dd>
        <p className="mt-0.5 text-xs text-brand-muted">
          {stats
            ? `${stats.maleCount} male, ${stats.femaleCount} female`
            : "Gender distribution"}
        </p>
      </div>

      <div className={LIST_PAGE_INSIGHT_CELL_CLASS}>
        <dt className={LIST_PAGE_INSIGHT_LABEL_CLASS}>
          Average age
        </dt>
        <dd className={LIST_PAGE_INSIGHT_VALUE_CLASS}>
          {stats ? `${stats.averageAge} yrs` : "-"}
        </dd>
        <p className="mt-0.5 text-xs text-brand-muted">Client population mean</p>
      </div>
    </dl>
  );
}

/** @deprecated Use {@link CustomerSummaryStatsCards} */
export const CustomerSummaryStats = CustomerSummaryStatsCards;
