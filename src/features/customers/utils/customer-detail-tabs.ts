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
  "relationships",
  "employment",
  "appointments",
  "notes",
] as const;

export type CustomerDetailTabId = (typeof CUSTOMER_DETAIL_TAB_IDS)[number];

export type CustomerDetailTabSurface = "tab" | "menu";

export type CustomerDetailTab = {
  id: CustomerDetailTabId;
  label: string;
  segment: string | null;
  icon: AppIconName;
  /** `tab` renders in the bar; `menu` lives under More (like OPD). */
  surface: CustomerDetailTabSurface;
};

export const CUSTOMER_DETAIL_TABS: CustomerDetailTab[] = [
  { id: "summary", label: "Summary", segment: null, icon: "grid", surface: "tab" },
  {
    id: "orders",
    label: "Sales Orders",
    segment: "orders",
    icon: "clipboard",
    surface: "tab",
  },
  {
    id: "invoices",
    label: "Invoices",
    segment: "invoices",
    icon: "invoice",
    surface: "menu",
  },
  {
    id: "payments",
    label: "Payments",
    segment: "payments",
    icon: "wallet",
    surface: "menu",
  },
  {
    id: "visits",
    label: "Visits",
    segment: "visits",
    icon: "heartPulse",
    surface: "menu",
  },
  {
    id: "insurance",
    label: "Insurance & payers",
    segment: "insurance",
    icon: "shield",
    surface: "tab",
  },
  {
    id: "benefits",
    label: "Benefits",
    segment: "benefits",
    icon: "layers",
    surface: "tab",
  },
  {
    id: "addresses",
    label: "Address",
    segment: "addresses",
    icon: "home",
    surface: "menu",
  },
  {
    id: "legal-guardians",
    label: "Legal guardians",
    segment: "legal-guardians",
    icon: "users",
    surface: "tab",
  },
  {
    id: "relationships",
    label: "Relationships",
    segment: "relationships",
    icon: "users",
    surface: "tab",
  },
  {
    id: "employment",
    label: "Employment",
    segment: "employment",
    icon: "building",
    surface: "menu",
  },
  {
    id: "appointments",
    label: "Appointments",
    segment: "appointments",
    icon: "calendar",
    surface: "tab",
  },
  { id: "notes", label: "Notes", segment: "notes", icon: "file", surface: "tab" },
];

const TAB_SEGMENTS = new Set(
  CUSTOMER_DETAIL_TABS.flatMap((tab) => (tab.segment ? [tab.segment] : [])),
);

export type CustomerDetailTabVisibility = {
  showBenefitsTab?: boolean;
  showEmploymentTab?: boolean;
};

function isCustomerDetailTabVisible(
  tab: CustomerDetailTab,
  visibility: CustomerDetailTabVisibility,
): boolean {
  if (tab.id === "benefits" && !visibility.showBenefitsTab) {
    return false;
  }
  if (tab.id === "employment" && !visibility.showEmploymentTab) {
    return false;
  }
  return true;
}

export function getCustomerDetailPrimaryTabs(
  visibility: CustomerDetailTabVisibility = {},
): CustomerDetailTab[] {
  return CUSTOMER_DETAIL_TABS.filter(
    (tab) => tab.surface === "tab" && isCustomerDetailTabVisible(tab, visibility),
  );
}

export function getCustomerDetailMenuTabs(
  visibility: CustomerDetailTabVisibility = {},
): CustomerDetailTab[] {
  return CUSTOMER_DETAIL_TABS.filter(
    (tab) =>
      tab.surface === "menu" && isCustomerDetailTabVisible(tab, visibility),
  );
}

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
