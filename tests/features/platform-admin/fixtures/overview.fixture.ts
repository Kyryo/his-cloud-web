import type {
  PlatformAdminDashboard,
  PlatformAdminOverview,
  PlatformAdminTenant,
} from "@/features/platform-admin/types/platform-admin.types";

const COHORT_MONTHS = [
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
const DECAY = [
  1, 0.86, 0.78, 0.72, 0.69, 0.66, 0.64, 0.62, 0.61, 0.6, 0.59, 0.58,
];

export const overviewFixture: PlatformAdminOverview = {
  summary: {
    active_tenants: 42,
    revenue: {
      amount: "18450",
      currency_code: "USD",
      period_label: "October 2026",
    },
    burn_rate: { amount: "9200", currency_code: "USD", window_months: 3 },
    runway_months: 19,
  },
  cohort_retention: {
    activity_definition: "sales_order_or_invoice",
    cohorts: COHORT_MONTHS.map((month, i) => {
      const size = 3 + ((i * 5) % 7);
      return {
        cohort_month: month,
        tenant_count: size,
        months: DECAY.slice(0, COHORT_MONTHS.length - i).map((d, offset) => {
          const active = Math.max(
            0,
            Math.round(size * (d - ((i + offset) % 3) * 0.03)),
          );
          return {
            offset,
            active_count: active,
            retention_rate: active / size,
          };
        }),
      };
    }),
  },
  net_dollar_retention: {
    current_month_ndr_percent: 112.4,
    series: [
      96.2, 98.4, 101.3, 99.8, 103.6, 105.1, 104.2, 107.9, 109.3, 108.1, 110.6,
      112.4,
    ].map((v, i) => ({ month: COHORT_MONTHS[i], ndr_percent: v })),
  },
};

const NAMES = [
  "Lakeview Dental",
  "Shire Valley Clinic",
  "Mzuzu Family Health",
  "Blantyre Smiles",
  "Zomba Eye Centre",
  "Lilongwe Paeds",
  "Kasungu Medical",
  "Mangochi Dental Care",
  "Karonga Health Hub",
  "Salima Wellness",
];

export const tenantsFixture: PlatformAdminTenant[] = Array.from(
  { length: 46 },
  (_, i) => {
    const monthsAgo = Math.floor((45 - i) / 3.2);
    const created = new Date(Date.UTC(2026, 9 - monthsAgo, 1 + ((i * 7) % 13)));
    return {
      id: i + 1,
      uuid: `tenant-${i + 1}`,
      name: `${NAMES[i % NAMES.length]}${i >= NAMES.length ? ` ${Math.floor(i / NAMES.length) + 1}` : ""}`,
      code: `T${String(i + 1).padStart(3, "0")}`,
      city: ["Blantyre", "Lilongwe", "Mzuzu", "Zomba"][i % 4],
      country: "Malawi",
      status: i % 11 === 0 ? "SUSPENDED" : i % 7 === 0 ? "PENDING" : "ACTIVE",
      is_active: i % 11 !== 0,
      user_count: 4 + (i % 9),
      active_user_count: 2 + (i % 6),
      clinic_count: 1 + (i % 3),
      created_at: created.toISOString(),
    } as unknown as PlatformAdminTenant;
  },
);

export const dashboardFixture: PlatformAdminDashboard = {
  total_tenants: 46,
  active_tenants: 42,
  suspended_tenants: 2,
  pending_tenants: 2,
  total_clinics: 91,
  total_locations: 128,
  total_products: 5320,
  total_users: 612,
  active_users: 447,
};
