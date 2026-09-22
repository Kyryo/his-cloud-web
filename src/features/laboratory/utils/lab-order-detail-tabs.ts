import type { AppIconName } from "@/components/icons/app-icon";
import { ROUTES } from "@/constants/routes";

export const LAB_ORDER_DETAIL_TAB_IDS = [
  "overview",
  "specimens",
  "results",
] as const;

export type LabOrderDetailTabId = (typeof LAB_ORDER_DETAIL_TAB_IDS)[number];

export type LabOrderDetailTab = {
  id: LabOrderDetailTabId;
  label: string;
  segment: string | null;
  icon: AppIconName;
};

export const LAB_ORDER_DETAIL_TABS: LabOrderDetailTab[] = [
  { id: "overview", label: "Orders", segment: null, icon: "grid" },
  { id: "specimens", label: "Specimens", segment: "specimens", icon: "flask" },
  { id: "results", label: "Results", segment: "results", icon: "file" },
];

const TAB_SEGMENTS = new Set(
  LAB_ORDER_DETAIL_TABS.flatMap((tab) => (tab.segment ? [tab.segment] : [])),
);

export function isLabOrderDetailTabSegment(segment: string | undefined): boolean {
  return !segment || TAB_SEGMENTS.has(segment);
}

export function labOrderDetailTabHref(
  orderUuid: string,
  tabId: LabOrderDetailTabId = "overview",
): string {
  return ROUTES.labOrderDetailTab(orderUuid, tabId === "overview" ? undefined : tabId);
}

export function labOrderDetailTabFromPathname(
  pathname: string,
  orderUuid: string,
): LabOrderDetailTabId {
  const prefix = `/lab-orders/${orderUuid}`;
  if (pathname !== prefix && !pathname.startsWith(`${prefix}/`)) {
    return "overview";
  }

  const segment = pathname.slice(prefix.length).replace(/^\//, "").split("/")[0];
  const tab = LAB_ORDER_DETAIL_TABS.find((item) => item.segment === segment);
  return tab?.id ?? "overview";
}
