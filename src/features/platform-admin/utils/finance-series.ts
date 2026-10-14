import type {
  PlatformAdminCashSnapshot,
  PlatformAdminOperatingCost,
  PlatformAdminTenantPayment,
} from "@/features/platform-admin/types/platform-admin.types";
import {
  computeDelta,
  type SeriesDelta,
} from "@/features/platform-admin/utils/overview-series";

export type FinanceRecords = {
  payments: PlatformAdminTenantPayment[];
  costs: PlatformAdminOperatingCost[];
  cash: PlatformAdminCashSnapshot[];
};

export type FinanceMonthPoint = {
  month: string;
  revenue: number;
  costs: number;
  net: number;
};

export type FinanceRecordKind = "payment" | "cost" | "cash";

export type FinanceRecordRow = {
  id: string;
  kind: FinanceRecordKind;
  date: string;
  amount: number;
  currency: string;
  title: string;
  detail: string;
};

export type FinanceSummary = {
  currency: string;
  /** Records in other currencies are excluded from totals and charts. */
  excludedRecordCount: number;
  revenueThisMonth: number;
  revenueDelta: SeriesDelta | null;
  costsThisMonth: number;
  costsDelta: SeriesDelta | null;
  netThisMonth: number;
  latestCash: { amount: number; date: string } | null;
  cashDelta: SeriesDelta | null;
  revenueSpark: number[];
  costsSpark: number[];
  cashSpark: number[];
};

const monthOf = (date: string) => date.slice(0, 7);
const toNumber = (value: string) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

function nextMonth(month: string): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** Most common currency across all records (fallback USD). */
export function dominantCurrency(records: FinanceRecords): string {
  const counts = new Map<string, number>();
  for (const r of [...records.payments, ...records.costs, ...records.cash]) {
    counts.set(r.currency_code, (counts.get(r.currency_code) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "USD";
}

/** Monthly revenue vs. costs for a single currency, gap-filled through `now`. */
export function buildFinanceMonthlySeries(
  records: FinanceRecords,
  currency: string,
  now: Date = new Date(),
): FinanceMonthPoint[] {
  const revenue = new Map<string, number>();
  const costs = new Map<string, number>();
  for (const p of records.payments) {
    if (p.currency_code !== currency) continue;
    const k = monthOf(p.payment_date);
    revenue.set(k, (revenue.get(k) ?? 0) + toNumber(p.amount));
  }
  for (const c of records.costs) {
    if (c.currency_code !== currency) continue;
    const k = monthOf(c.cost_date);
    costs.set(k, (costs.get(k) ?? 0) + toNumber(c.amount));
  }
  const months = [...revenue.keys(), ...costs.keys()].sort();
  if (months.length === 0) return [];
  const current = now.toISOString().slice(0, 7);
  const last = months.at(-1)! > current ? months.at(-1)! : current;
  const series: FinanceMonthPoint[] = [];
  for (let m = months[0]; m <= last; m = nextMonth(m)) {
    const r = revenue.get(m) ?? 0;
    const c = costs.get(m) ?? 0;
    series.push({ month: m, revenue: r, costs: c, net: r - c });
  }
  return series;
}

export function summarizeFinance(
  records: FinanceRecords,
  now: Date = new Date(),
): FinanceSummary {
  const currency = dominantCurrency(records);
  const series = buildFinanceMonthlySeries(records, currency, now);
  const cash = records.cash
    .filter((c) => c.currency_code === currency)
    .sort((a, b) => a.balance_date.localeCompare(b.balance_date));
  const cashValues = cash.map((c) => toNumber(c.amount));
  const revenueValues = series.map((p) => p.revenue);
  const costValues = series.map((p) => p.costs);
  const last = series.at(-1);
  const all =
    records.payments.length + records.costs.length + records.cash.length;
  const included =
    records.payments.filter((p) => p.currency_code === currency).length +
    records.costs.filter((c) => c.currency_code === currency).length +
    cash.length;

  return {
    currency,
    excludedRecordCount: all - included,
    revenueThisMonth: last?.revenue ?? 0,
    revenueDelta: computeDelta(revenueValues),
    costsThisMonth: last?.costs ?? 0,
    costsDelta: computeDelta(costValues),
    netThisMonth: last?.net ?? 0,
    latestCash: cash.length
      ? { amount: cashValues.at(-1)!, date: cash.at(-1)!.balance_date }
      : null,
    cashDelta: computeDelta(cashValues),
    revenueSpark: revenueValues.slice(-12),
    costsSpark: costValues.slice(-12),
    cashSpark: cashValues.slice(-12),
  };
}

const COST_LABELS: Record<string, string> = {
  infrastructure: "Infrastructure",
  payroll: "Payroll",
  software: "Software",
  support: "Support",
  other: "Other",
};

export function costCategoryLabel(category: string): string {
  return COST_LABELS[category] ?? category;
}

/** Unified, newest-first history of all finance records. */
export function buildFinanceRecordRows(
  records: FinanceRecords,
): FinanceRecordRow[] {
  const rows: FinanceRecordRow[] = [
    ...records.payments.map((p) => ({
      id: `payment-${p.uuid}`,
      kind: "payment" as const,
      date: p.payment_date,
      amount: toNumber(p.amount),
      currency: p.currency_code,
      title: p.tenant_name,
      detail: p.notes || "Tenant payment",
    })),
    ...records.costs.map((c) => ({
      id: `cost-${c.uuid}`,
      kind: "cost" as const,
      date: c.cost_date,
      amount: toNumber(c.amount),
      currency: c.currency_code,
      title: costCategoryLabel(c.category),
      detail: c.description || "Operating cost",
    })),
    ...records.cash.map((c) => ({
      id: `cash-${c.uuid}`,
      kind: "cash" as const,
      date: c.balance_date,
      amount: toNumber(c.amount),
      currency: c.currency_code,
      title: "Cash balance",
      detail: "Balance snapshot",
    })),
  ];
  return rows.sort(
    (a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id),
  );
}

function formatStandardMoney(
  amount: number,
  currency: string,
  fractionDigits: number,
): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: fractionDigits,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(fractionDigits)}`;
  }
}

/**
 * Currency formatting. `compact` uses a deterministic k/M suffix instead of
 * Intl compact notation, whose output differs between Node and browser ICU data
 * (which caused hydration mismatches).
 */
export function formatMoney(
  amount: number,
  currency: string,
  compact = false,
): string {
  if (!compact || Math.abs(amount) < 1000) {
    return formatStandardMoney(Math.round(amount), currency, 0);
  }
  const [divisor, suffix] =
    Math.abs(amount) >= 1_000_000 ? [1_000_000, "M"] : [1000, "k"];
  return `${formatStandardMoney(Math.round((amount / divisor) * 10) / 10, currency, 1)}${suffix}`;
}
