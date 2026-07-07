import type { ChartConfig } from "@/components/ui/chart";

export const platformAdminUsageTrendChartConfig = {
  sign_ins: {
    label: "Sign-ins",
    color: "#0b6e6e",
  },
  visits: {
    label: "Visits",
    color: "#2f5e46",
  },
  appointments: {
    label: "Appointments",
    color: "#4a7c59",
  },
  sales_orders: {
    label: "Sales orders",
    color: "#b86a1f",
  },
  invoices: {
    label: "Invoices",
    color: "#6b4c9a",
  },
  payments: {
    label: "Payments",
    color: "#1f6f8b",
  },
  claims: {
    label: "Claims",
    color: "#8b4513",
  },
} satisfies ChartConfig;

export const platformAdminUsageHourChartConfig = {
  count: {
    label: "Events",
    color: "#0b6e6e",
  },
} satisfies ChartConfig;

export const PLATFORM_ADMIN_USAGE_METRICS = [
  { key: "sign_ins", label: "Sign-ins" },
  { key: "visits", label: "Visits" },
  { key: "appointments", label: "Appointments" },
  { key: "sales_orders", label: "Sales orders" },
  { key: "invoices", label: "Invoices" },
  { key: "payments", label: "Payments" },
  { key: "claims", label: "Claims" },
] as const;
