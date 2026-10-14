import { describe, expect, it } from "vitest";

import {
  cashSnapshotEntrySchema,
  tenantPaymentEntrySchema,
} from "@/features/platform-admin/schemas/finance-entry.schema";
import {
  buildFinanceMonthlySeries,
  buildFinanceRecordRows,
  dominantCurrency,
  summarizeFinance,
  type FinanceRecords,
} from "@/features/platform-admin/utils/finance-series";
import { buildFinanceStats } from "@/features/platform-admin/utils/finance-stats";

const payment = (date: string, amount: string, currency = "USD") => ({
  id: 1,
  uuid: `p-${date}-${amount}`,
  tenant: 1,
  tenant_name: "Acme",
  tenant_uuid: "t",
  amount,
  currency_code: currency,
  payment_date: date,
  period_start: null,
  period_end: null,
  notes: "",
  created_at: date,
});
const cost = (date: string, amount: string) => ({
  id: 1,
  uuid: `c-${date}`,
  category: "software" as const,
  amount,
  currency_code: "USD",
  cost_date: date,
  description: "",
  created_at: date,
});

const records: FinanceRecords = {
  payments: [
    payment("2026-08-03", "1000"),
    payment("2026-10-01", "1500"),
    payment("2026-10-02", "99", "EUR"),
  ],
  costs: [cost("2026-09-10", "400"), cost("2026-10-11", "600")],
  cash: [
    {
      id: 1,
      uuid: "a",
      balance_date: "2026-09-01",
      amount: "5000",
      currency_code: "USD",
      created_at: "",
    },
    {
      id: 2,
      uuid: "b",
      balance_date: "2026-10-01",
      amount: "5900",
      currency_code: "USD",
      created_at: "",
    },
  ],
};
const now = new Date("2026-10-14T00:00:00Z");

describe("finance series", () => {
  it("picks the dominant currency", () => {
    expect(dominantCurrency(records)).toBe("USD");
  });

  it("builds a gap-filled monthly series in one currency", () => {
    expect(buildFinanceMonthlySeries(records, "USD", now)).toEqual([
      { month: "2026-08", revenue: 1000, costs: 0, net: 1000 },
      { month: "2026-09", revenue: 0, costs: 400, net: -400 },
      { month: "2026-10", revenue: 1500, costs: 600, net: 900 },
    ]);
  });

  it("summarizes the current month, cash and excluded records", () => {
    const s = summarizeFinance(records, now);
    expect(s.revenueThisMonth).toBe(1500);
    expect(s.revenueDelta?.change).toBe(1500);
    expect(s.costsThisMonth).toBe(600);
    expect(s.netThisMonth).toBe(900);
    expect(s.latestCash).toEqual({ amount: 5900, date: "2026-10-01" });
    expect(s.cashDelta?.change).toBe(900);
    expect(s.excludedRecordCount).toBe(1);
  });

  it("treats rising costs as a negative signal", () => {
    const stats = buildFinanceStats(summarizeFinance(records, now));
    expect(stats.find((x) => x.id === "costs")?.delta?.value.direction).toBe(
      "down",
    );
    expect(stats.find((x) => x.id === "revenue")?.delta?.value.direction).toBe(
      "up",
    );
  });

  it("returns empty structures without records", () => {
    const empty = { payments: [], costs: [], cash: [] };
    expect(buildFinanceMonthlySeries(empty, "USD", now)).toEqual([]);
    const s = summarizeFinance(empty, now);
    expect(s.latestCash).toBeNull();
    expect(buildFinanceStats(s).every((x) => !x.sparkline)).toBe(true);
  });

  it("merges records newest first", () => {
    const rows = buildFinanceRecordRows(records);
    expect(rows[0]).toMatchObject({
      kind: "cost",
      date: "2026-10-11",
      amount: 600,
    });
    expect(rows.map((r) => r.kind)).toContain("cash");
    expect(rows).toHaveLength(7);
  });
});

describe("finance entry schemas", () => {
  it("validates payments", () => {
    const bad = tenantPaymentEntrySchema.safeParse({
      tenant: "",
      amount: "-1",
      payment_date: "2026-01-01",
    });
    expect(bad.success).toBe(false);
    const messages = bad.success ? [] : bad.error.issues.map((i) => i.message);
    expect(messages).toContain("Select a tenant");
    expect(messages).toContain("Amount must be greater than 0");
    expect(
      tenantPaymentEntrySchema.safeParse({
        tenant: "3",
        amount: "120.50",
        payment_date: "2026-01-01",
      }).success,
    ).toBe(true);
  });

  it("rejects future dates and allows a zero cash balance", () => {
    expect(
      cashSnapshotEntrySchema.safeParse({
        amount: "0",
        balance_date: "2026-01-01",
      }).success,
    ).toBe(true);
    expect(
      cashSnapshotEntrySchema.safeParse({
        amount: "10",
        balance_date: "2999-01-01",
      }).success,
    ).toBe(false);
  });
});

describe("formatMoney", () => {
  it("formats compact values deterministically", async () => {
    const { formatMoney } =
      await import("@/features/platform-admin/utils/finance-series");
    expect(formatMoney(120, "USD", true)).toMatch(/120$/);
    expect(formatMoney(12500, "USD", true)).toMatch(/12\.5k$/);
    expect(formatMoney(2_000_000, "USD", true)).toMatch(/2M$/);
  });
});
