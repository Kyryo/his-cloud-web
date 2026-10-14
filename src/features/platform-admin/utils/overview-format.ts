import type {
  PlatformAdminOverview,
  PlatformAdminOverviewBurnRate,
  PlatformAdminOverviewRevenue,
} from "@/features/platform-admin/types/platform-admin.types";

export function formatOverviewMoney(
  metric: PlatformAdminOverviewRevenue | PlatformAdminOverviewBurnRate,
): string {
  const amount = Number(metric.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return "—";
  }
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: metric.currency_code,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function hasOverviewFinanceData(
  overview: PlatformAdminOverview,
): boolean {
  const revenue = Number(overview.summary.revenue.amount);
  const burn = Number(overview.summary.burn_rate.amount);
  return revenue > 0 || burn > 0 || overview.summary.runway_months !== null;
}
