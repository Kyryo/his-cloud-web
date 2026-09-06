import type { AppIconName } from "@/components/icons/app-icon";

export const CUSTOMER_DETAIL_TAB_IDS = [
  "summary",
  "orders",
  "invoices",
  "payments",
  "visits",
  "insurance",
  "benefits",
  "addresses",
  "legal-guardians",
  "appointments",
  "notes",
] as const;

export type CustomerDetailTabId = (typeof CUSTOMER_DETAIL_TAB_IDS)[number];

export type CustomerDetailTab = {
  id: CustomerDetailTabId;
  label: string;
  segment: string | null;
  icon: AppIconName;
};

export const CUSTOMER_DETAIL_TABS: CustomerDetailTab[] = [
  { id: "summary", label: "Summary", segment: null, icon: "grid" },
  { id: "orders", label: "Sales Orders", segment: "orders", icon: "clipboard" },
  { id: "invoices", label: "Invoices", segment: "invoices", icon: "invoice" },
  { id: "payments", label: "Payments", segment: "payments", icon: "wallet" },
  { id: "visits", label: "Visits", segment: "visits", icon: "heartPulse" },
  { id: "insurance", label: "Insurance", segment: "insurance", icon: "shield" },
  { id: "benefits", label: "Benefits", segment: "benefits", icon: "layers" },
  { id: "addresses", label: "Address", segment: "addresses", icon: "home" },
  {
    id: "legal-guardians",
    label: "Legal guardians",
    segment: "legal-guardians",
    icon: "users",
  },
  {
    id: "appointments",
    label: "Appointments",
    segment: "appointments",
    icon: "calendar",
  },
  { id: "notes", label: "Notes", segment: "notes", icon: "file" },
];

const TAB_SEGMENTS = new Set(
  CUSTOMER_DETAIL_TABS.flatMap((tab) => (tab.segment ? [tab.segment] : [])),
);

export function isCustomerDetailTabSegment(segment: string | undefined): boolean {
  return !segment || TAB_SEGMENTS.has(segment);
}

export function customerDetailTabHref(
  customerId: string,
  tabId: CustomerDetailTabId = "summary",
): string {
  const tab = CUSTOMER_DETAIL_TABS.find((item) => item.id === tabId);
  if (!tab?.segment) {
    return `/customers/${customerId}`;
  }
  return `/customers/${customerId}/${tab.segment}`;
}

export function customerDetailTabFromPathname(
  pathname: string,
  customerId: string,
): CustomerDetailTabId {
  const prefix = `/customers/${customerId}`;
  if (pathname !== prefix && !pathname.startsWith(`${prefix}/`)) {
    return "summary";
  }

  const segment = pathname.slice(prefix.length).replace(/^\//, "").split("/")[0];
  const tab = CUSTOMER_DETAIL_TABS.find((item) => item.segment === segment);
  return tab?.id ?? "summary";
}
