import {
  formatMoney,
  type FinanceSummary,
} from "@/features/platform-admin/utils/finance-series";
import type { OverviewStat } from "@/features/platform-admin/utils/overview-stats";

const moneyDelta = (currency: string) => (c: number) =>
  `${c > 0 ? "+" : c < 0 ? "−" : ""}${formatMoney(Math.abs(c), currency, true)}`;

/** Headline finance stats; deltas and sparklines only when two or more points exist. */
export function buildFinanceStats(s: FinanceSummary): OverviewStat[] {
  const fmt = moneyDelta(s.currency);
  const costsDelta = s.costsDelta
    ? {
        // Lower costs are good: flip the colour direction while keeping the signed amount.
        value: {
          ...s.costsDelta,
          direction:
            s.costsDelta.direction === "up"
              ? ("down" as const)
              : s.costsDelta.direction === "down"
                ? ("up" as const)
                : ("flat" as const),
        },
        format: fmt,
      }
    : null;
  return [
    {
      id: "revenue",
      label: "Revenue this month",
      value: formatMoney(s.revenueThisMonth, s.currency),
      delta: s.revenueDelta ? { value: s.revenueDelta, format: fmt } : null,
      caption: s.revenueDelta ? "vs last month" : "Tenant payments",
      sparkline: s.revenueSpark.length > 1 ? s.revenueSpark : null,
    },
    {
      id: "costs",
      label: "Costs this month",
      value: formatMoney(s.costsThisMonth, s.currency),
      delta: costsDelta,
      caption: s.costsDelta ? "vs last month" : "Operating costs",
      sparkline: s.costsSpark.length > 1 ? s.costsSpark : null,
    },
    {
      id: "net",
      label: "Net this month",
      value: formatMoney(s.netThisMonth, s.currency),
      caption:
        s.netThisMonth >= 0 ? "Revenue exceeds costs" : "Costs exceed revenue",
    },
    {
      id: "cash",
      label: "Cash balance",
      value: s.latestCash ? formatMoney(s.latestCash.amount, s.currency) : "—",
      delta: s.cashDelta ? { value: s.cashDelta, format: fmt } : null,
      caption: s.latestCash
        ? `as of ${new Date(`${s.latestCash.date}T00:00:00`).toLocaleDateString(undefined, { day: "numeric", month: "short" })}`
        : "Record a cash balance",
      sparkline: s.cashSpark.length > 1 ? s.cashSpark : null,
    },
  ];
}
