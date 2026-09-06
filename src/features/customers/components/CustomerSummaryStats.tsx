"use client";

import { Skeleton } from "@/components/ui/skeleton";
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
        className="grid grid-cols-2 divide-y divide-dash-border/60 border-y border-dash-border/80 py-2 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x"
        data-testid="customer-summary-stats"
        aria-busy="true"
      >
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="p-3.5 sm:p-4">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="mt-2.5 h-8 w-16" />
            <Skeleton className="mt-1.5 h-3 w-28" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <dl
      className="grid grid-cols-2 divide-y divide-dash-border/60 border-y border-dash-border/80 py-2 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x"
      data-testid="customer-summary-stats"
    >
      {/* 1. Total Clients */}
      <div className="p-3.5 transition-colors hover:bg-dash-canvas/40 sm:p-4">
        <div className="flex items-center gap-2">
          <span className="size-2 shrink-0 rounded-full bg-brand-primary" />
          <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-dash-muted">
            Total clients
          </dt>
        </div>
        <dd className="mt-1.5 text-2xl font-bold tracking-tight text-brand-navy tabular-nums sm:text-3xl">
          {formatCompactNumber(totalClients)}
        </dd>
        <p className="mt-0.5 text-xs text-brand-muted">Active patient directory</p>
      </div>

      {/* 2. New this month */}
      <div className="p-3.5 transition-colors hover:bg-dash-canvas/40 sm:p-4">
        <div className="flex items-center gap-2">
          <span className="size-2 shrink-0 rounded-full bg-emerald-500" />
          <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-dash-muted">
            New this month
          </dt>
        </div>
        <dd className="mt-1.5 text-2xl font-bold tracking-tight text-brand-navy tabular-nums sm:text-3xl">
          {formatCompactNumber(newThisMonth)}
        </dd>
        <p className="mt-0.5 text-xs text-brand-muted">
          {newPercentage !== undefined ? (
            <span className="font-medium text-emerald-700">+{newPercentage}% of directory</span>
          ) : (
            "Recent registrations"
          )}
        </p>
      </div>

      {/* 3. Male / Female */}
      <div className="p-3.5 transition-colors hover:bg-dash-canvas/40 sm:p-4">
        <div className="flex items-center gap-2">
          <span className="size-2 shrink-0 rounded-full bg-blue-500" />
          <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-dash-muted">
            Male / Female
          </dt>
        </div>
        <dd className="mt-1.5 text-2xl font-bold tracking-tight text-brand-navy tabular-nums sm:text-3xl">
          {stats ? formatGenderCounts(stats) : "—"}
        </dd>
        <p className="mt-0.5 text-xs text-brand-muted">
          {stats ? `${stats.maleCount} male · ${stats.femaleCount} female` : "Gender distribution"}
        </p>
      </div>

      {/* 4. Average age */}
      <div className="p-3.5 transition-colors hover:bg-dash-canvas/40 sm:p-4">
        <div className="flex items-center gap-2">
          <span className="size-2 shrink-0 rounded-full bg-amber-500" />
          <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-dash-muted">
            Average age
          </dt>
        </div>
        <dd className="mt-1.5 text-2xl font-bold tracking-tight text-brand-navy tabular-nums sm:text-3xl">
          {stats ? `${stats.averageAge} yrs` : "—"}
        </dd>
        <p className="mt-0.5 text-xs text-brand-muted">Patient population mean</p>
      </div>
    </dl>
  );
}

/** @deprecated Use {@link CustomerSummaryStatsCards} */
export const CustomerSummaryStats = CustomerSummaryStatsCards;
