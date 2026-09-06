import type { AppIconName } from "@/components/icons/app-icon";

export const INVOICE_DETAIL_TAB_IDS = [
  "client",
  "claim",
  "payments",
  "diagnoses",
  "activity",
] as const;

export type InvoiceDetailTabId = (typeof INVOICE_DETAIL_TAB_IDS)[number];

export type InvoiceDetailTab = {
  id: InvoiceDetailTabId;
  label: string;
  icon: AppIconName;
};

export const INVOICE_DETAIL_TABS: InvoiceDetailTab[] = [
  { id: "client", label: "Client", icon: "user" },
  { id: "claim", label: "Claim", icon: "shield" },
  { id: "payments", label: "Payments", icon: "wallet" },
  { id: "diagnoses", label: "Diagnoses", icon: "stethoscope" },
  { id: "activity", label: "Activity", icon: "activity" },
];
