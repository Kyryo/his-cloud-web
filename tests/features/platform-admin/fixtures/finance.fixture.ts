import type { FinanceRecords } from "@/features/platform-admin/utils/finance-series";
import type {
  PlatformAdminCashSnapshot,
  PlatformAdminOperatingCost,
  PlatformAdminTenantPayment,
} from "@/features/platform-admin/types/platform-admin.types";

const MONTHS = [
  "2025-11",
  "2025-12",
  "2026-01",
  "2026-02",
  "2026-03",
  "2026-04",
  "2026-05",
  "2026-06",
  "2026-07",
  "2026-08",
  "2026-09",
  "2026-10",
];
const TENANTS = [
  "Lakeview Dental",
  "Shire Valley Clinic",
  "Mzuzu Family Health",
  "Blantyre Smiles",
  "Zomba Eye Centre",
];
const CATEGORIES = [
  "infrastructure",
  "payroll",
  "software",
  "support",
  "other",
] as const;

export const financeFixture: FinanceRecords = {
  payments: MONTHS.flatMap((m, i) =>
    TENANTS.slice(0, 2 + (i % 4)).map((name, t) => ({
      id: i * 10 + t,
      uuid: `p-${i}-${t}`,
      tenant: t + 1,
      tenant_name: name,
      tenant_uuid: `tenant-${t + 1}`,
      amount: String(900 + i * 140 + t * 210),
      currency_code: "USD",
      payment_date: `${m}-${String(2 + t * 2).padStart(2, "0")}`,
      period_start: null,
      period_end: null,
      notes: t === 0 ? `Invoice INV-${1000 + i}` : "",
      created_at: `${m}-05T10:00:00Z`,
    })),
  ) as PlatformAdminTenantPayment[],
  costs: MONTHS.flatMap((m, i) =>
    CATEGORIES.slice(0, 3).map((category, c) => ({
      id: i * 10 + c,
      uuid: `c-${i}-${c}`,
      category,
      amount: String([1400, 2600, 380][c] + i * 40),
      currency_code: "USD",
      cost_date: `${m}-${String(8 + c * 3).padStart(2, "0")}`,
      description: ["AWS + Cloudflare", "Engineering team", "SaaS tooling"][c],
      created_at: `${m}-10T10:00:00Z`,
    })),
  ) as PlatformAdminOperatingCost[],
  cash: MONTHS.map((m, i) => ({
    id: i,
    uuid: `cash-${i}`,
    balance_date: `${m}-01`,
    amount: String(120000 + i * 3200 - (i % 3) * 2100),
    currency_code: "USD",
    created_at: `${m}-01T10:00:00Z`,
  })) as PlatformAdminCashSnapshot[],
};
