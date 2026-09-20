import type { AppIconName } from "@/components/icons/app-icon";
import { ROUTES } from "@/constants/routes";

export const LAB_PANEL_DETAIL_TAB_IDS = [
  "overview",
  "tests",
  "activity",
] as const;

export type LabPanelDetailTabId = (typeof LAB_PANEL_DETAIL_TAB_IDS)[number];

export type LabPanelDetailTab = {
  id: LabPanelDetailTabId;
  label: string;
  segment: string | null;
  icon: AppIconName;
};

export const LAB_PANEL_DETAIL_TABS: LabPanelDetailTab[] = [
  { id: "overview", label: "Overview", segment: null, icon: "grid" },
  { id: "tests", label: "Tests", segment: "tests", icon: "flask" },
  { id: "activity", label: "Activity", segment: "activity", icon: "activity" },
];

const TAB_SEGMENTS = new Set(
  LAB_PANEL_DETAIL_TABS.flatMap((tab) => (tab.segment ? [tab.segment] : [])),
);

export function isLabPanelDetailTabSegment(segment: string | undefined): boolean {
  return !segment || TAB_SEGMENTS.has(segment);
}

export function labPanelDetailTabHref(
  panelUuid: string,
  tabId: LabPanelDetailTabId = "overview",
): string {
  return ROUTES.labPanelDetailTab(
    panelUuid,
    tabId === "overview" ? undefined : tabId,
  );
}

export function labPanelDetailTabFromPathname(
  pathname: string,
  panelUuid: string,
): LabPanelDetailTabId {
  const prefix = `/lab/panels/${panelUuid}`;
  if (pathname !== prefix && !pathname.startsWith(`${prefix}/`)) {
    return "overview";
  }

  const segment = pathname.slice(prefix.length).replace(/^\//, "").split("/")[0];
  const tab = LAB_PANEL_DETAIL_TABS.find((item) => item.segment === segment);
  return tab?.id ?? "overview";
}
