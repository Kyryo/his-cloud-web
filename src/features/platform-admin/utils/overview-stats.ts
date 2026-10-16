import type { PlatformAdminOverview } from "@/features/platform-admin/types/platform-admin.types";
import { formatOverviewMoney } from "@/features/platform-admin/utils/overview-format";
import {
  computeDelta,
  type SeriesDelta,
  type TenantGrowthPoint,
} from "@/features/platform-admin/utils/overview-series";

export type OverviewStat = {
  id: string;
  label: string;
  value: string;
  /** Secondary caption shown next to the delta (or alone). */
  caption?: string;
  delta?: { value: SeriesDelta; format: (change: number) => string } | null;
  sparkline?: number[] | null;
};

const SPARK_MONTHS = 12;

/**
 * Headline stats. Deltas and sparklines are attached only where a real time series
 * exists (tenant creation dates, NDR series); revenue and runway are point values.
 */
export function buildOverviewStats(
  overview: PlatformAdminOverview,
  growth: TenantGrowthPoint[],
): OverviewStat[] {
  const { summary, net_dollar_retention: ndr } = overview;
  const revenue = formatOverviewMoney(summary.revenue);
  const burn = formatOverviewMoney(summary.burn_rate);
  const growthTotals = growth.slice(-SPARK_MONTHS).map((p) => p.total);
  const latestGrowth = growth.at(-1);
  const ndrValues = ndr.series.slice(-SPARK_MONTHS).map((p) => p.ndr_percent);
  const ndrDelta = computeDelta(ndrValues);

  return [
    {
      id: "tenants",
      label: "Active tenants",
      value: summary.active_tenants.toLocaleString(),
      delta: latestGrowth
        ? {
            value: {
              current: latestGrowth.total,
              previous: latestGrowth.total - latestGrowth.added,
              change: latestGrowth.added,
              direction: latestGrowth.added > 0 ? "up" : "flat",
            },
            format: (c) => `+${c}`,
          }
        : null,
      caption: latestGrowth ? "onboarded this month" : undefined,
      sparkline: growthTotals.length > 1 ? growthTotals : null,
    },
    {
      id: "revenue",
      label: "Revenue",
      value: revenue,
      caption:
        revenue === "—"
          ? "Record payments to populate"
          : summary.revenue.period_label,
    },
    {
      id: "runway",
      label: "Runway",
      value:
        summary.runway_months !== null ? `${summary.runway_months} mo` : "—",
      caption:
        burn === "—"
          ? "Record cash balance and costs"
          : `${burn}/mo burn · trailing ${summary.burn_rate.window_months} mo`,
    },
    {
      id: "ndr",
      label: "Net dollar retention",
      value:
        ndr.current_month_ndr_percent !== null
          ? `${ndr.current_month_ndr_percent}%`
          : "—",
      delta: ndrDelta
        ? { value: ndrDelta, format: (c) => `${c > 0 ? "+" : ""}${c} pts` }
        : null,
      caption: ndrDelta ? "vs last month" : "Needs 13 months of payments",
      sparkline: ndrValues.length > 1 ? ndrValues : null,
    },
  ];
}
