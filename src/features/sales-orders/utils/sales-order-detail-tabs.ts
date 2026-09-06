import type { AppIconName } from "@/components/icons/app-icon";

export const SALES_ORDER_DETAIL_TAB_IDS = [
  "lines",
  "visit",
  "client",
  "activity",
] as const;

export type SalesOrderDetailTabId = (typeof SALES_ORDER_DETAIL_TAB_IDS)[number];

export type SalesOrderDetailTab = {
  id: SalesOrderDetailTabId;
  label: string;
  icon: AppIconName;
};

export const SALES_ORDER_DETAIL_TABS: SalesOrderDetailTab[] = [
  { id: "lines", label: "Line items", icon: "clipboard" },
  { id: "visit", label: "Visit", icon: "heartPulse" },
  { id: "client", label: "Client", icon: "user" },
  { id: "activity", label: "Activity", icon: "activity" },
];
