import type { AppIconName } from "@/components/icons/app-icon";

export const PAYMENT_DETAIL_TAB_IDS = ["overview", "client"] as const;

export type PaymentDetailTabId = (typeof PAYMENT_DETAIL_TAB_IDS)[number];

export type PaymentDetailTab = {
  id: PaymentDetailTabId;
  label: string;
  icon: AppIconName;
};

export const PAYMENT_DETAIL_TABS: PaymentDetailTab[] = [
  { id: "overview", label: "Overview", icon: "wallet" },
  { id: "client", label: "Client", icon: "user" },
];
