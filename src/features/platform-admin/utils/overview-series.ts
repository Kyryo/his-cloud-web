import type { PlatformAdminTenant } from "@/features/platform-admin/types/platform-admin.types";

export type TenantGrowthPoint = {
  /** Calendar month, formatted `YYYY-MM`. */
  month: string;
  /** Tenants created during the month. */
  added: number;
  /** Cumulative tenants created up to and including the month. */
  total: number;
};

export type SeriesDelta = {
  current: number;
  previous: number;
  change: number;
  direction: "up" | "down" | "flat";
};

export type OverviewRange = 3 | 6 | 12 | "all";

export const OVERVIEW_RANGE_LABELS: Record<OverviewRange, string> = {
  3: "3M",
  6: "6M",
  12: "12M",
  all: "All",
};

function toMonthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function nextMonthKey(month: string): string {
  const [year, mon] = month.split("-").map(Number);
  return toMonthKey(new Date(Date.UTC(year, mon, 1)));
}

/** Monthly tenant creation series derived from tenant `created_at` timestamps. */
export function buildTenantGrowthSeries(
  tenants: Pick<PlatformAdminTenant, "created_at">[],
  now: Date = new Date(),
): TenantGrowthPoint[] {
  const counts = new Map<string, number>();
  for (const tenant of tenants) {
    const created = new Date(tenant.created_at);
    if (Number.isNaN(created.getTime())) continue;
    const key = toMonthKey(created);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  if (counts.size === 0) return [];

  const first = [...counts.keys()].sort()[0];
  const last =
    toMonthKey(now) > first
      ? toMonthKey(now)
      : [...counts.keys()].sort().at(-1)!;
  const series: TenantGrowthPoint[] = [];
  let total = 0;
  for (let month = first; month <= last; month = nextMonthKey(month)) {
    const added = counts.get(month) ?? 0;
    total += added;
    series.push({ month, added, total });
  }
  return series;
}

export function sliceToRange<T>(series: T[], range: OverviewRange): T[] {
  return range === "all" ? series : series.slice(-range);
}

/** Ranges worth offering for a series of the given length (always includes "all"). */
export function availableRanges(length: number): OverviewRange[] {
  const ranges: OverviewRange[] = ([3, 6, 12] as const).filter(
    (r) => length > r,
  );
  return [...ranges, "all"];
}

/** Change between the last two values; null when there is not enough data. */
export function computeDelta(values: readonly number[]): SeriesDelta | null {
  if (values.length < 2) return null;
  const current = values[values.length - 1];
  const previous = values[values.length - 2];
  const change = Math.round((current - previous) * 10) / 10;
  return {
    current,
    previous,
    change,
    direction: change > 0 ? "up" : change < 0 ? "down" : "flat",
  };
}

export function getRecentTenants<
  T extends Pick<PlatformAdminTenant, "created_at">,
>(tenants: T[], limit = 6): T[] {
  return [...tenants]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, limit);
}

export function formatRelativeDate(
  iso: string,
  now: Date = new Date(),
): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  const days = Math.round((date.getTime() - now.getTime()) / 86_400_000);
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  if (Math.abs(days) < 1) return rtf.format(0, "day");
  if (Math.abs(days) < 30) return rtf.format(days, "day");
  if (Math.abs(days) < 365) return rtf.format(Math.round(days / 30), "month");
  return rtf.format(Math.round(days / 365), "year");
}

/** SVG path data for a sparkline line and its filled area. */
export function buildSparklinePaths(
  values: readonly number[],
  width: number,
  height: number,
  padding = 2,
): { line: string; area: string } | null {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const step = width / (values.length - 1);
  const points = values.map((v, i) => [
    Math.round(i * step * 100) / 100,
    Math.round(
      (height - padding - ((v - min) / span) * (height - padding * 2)) * 100,
    ) / 100,
  ]);
  const line = points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`)
    .join(" ");
  return { line, area: `${line} L${width},${height} L0,${height} Z` };
}
