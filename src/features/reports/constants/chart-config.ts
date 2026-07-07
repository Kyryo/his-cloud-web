import type { ChartConfig } from "@/components/ui/chart";

/** Brand-aligned chart colors for reports overview charts. */
export const salesActivityChartConfig = {
  sales_orders: {
    label: "Sales orders",
    color: "#0b6e6e",
  },
  invoices: {
    label: "Invoices",
    color: "#2f5e46",
  },
  payments: {
    label: "Payments",
    color: "#b86a1f",
  },
} satisfies ChartConfig;

export const salesByProviderChartConfig = {
  total: {
    label: "Total",
    color: "#0b6e6e",
  },
} satisfies ChartConfig;

export const visitsByPeriodChartConfig = {
  count: {
    label: "Visits",
    color: "#2f5e46",
  },
} satisfies ChartConfig;

export const REPORT_CHART_COLORS = {
  primary: "#0b6e6e",
  sky: "#2f5e46",
  amber: "#b86a1f",
} as const;
