import type { AppIconName } from "@/components/icons/app-icon";
import { ROUTES } from "@/constants/routes";

export const LAB_TEST_DETAIL_TAB_IDS = [
  "summary",
  "analytes",
  "reference-ranges",
  "activity",
] as const;

export type LabTestDetailTabId = (typeof LAB_TEST_DETAIL_TAB_IDS)[number];

export type LabTestDetailTab = {
  id: LabTestDetailTabId;
  label: string;
  segment: string | null;
  icon: AppIconName;
};

export const LAB_TEST_DETAIL_TABS: LabTestDetailTab[] = [
  { id: "summary", label: "Summary", segment: null, icon: "grid" },
  { id: "analytes", label: "Analytes", segment: "analytes", icon: "flask" },
  {
    id: "reference-ranges",
    label: "Reference ranges",
    segment: "reference-ranges",
    icon: "clipboard",
  },
  { id: "activity", label: "Activity", segment: "activity", icon: "activity" },
];

const TAB_SEGMENTS = new Set(
  LAB_TEST_DETAIL_TABS.flatMap((tab) => (tab.segment ? [tab.segment] : [])),
);

export function isLabTestDetailTabSegment(segment: string | undefined): boolean {
  return !segment || TAB_SEGMENTS.has(segment);
}

export function labTestDetailTabHref(
  testUuid: string,
  tabId: LabTestDetailTabId = "summary",
): string {
  return ROUTES.labTestDetailTab(
    testUuid,
    tabId === "summary" ? undefined : tabId,
  );
}

export function labTestDetailTabFromPathname(
  pathname: string,
  testUuid: string,
): LabTestDetailTabId {
  const prefix = `/lab/tests/${testUuid}`;
  if (pathname !== prefix && !pathname.startsWith(`${prefix}/`)) {
    return "summary";
  }

  const segment = pathname.slice(prefix.length).replace(/^\//, "").split("/")[0];
  const tab = LAB_TEST_DETAIL_TABS.find((item) => item.segment === segment);
  return tab?.id ?? "summary";
}

export function testHasNumericAnalytes(
  analytes: Array<{ value_type?: string | null }> | null | undefined,
): boolean {
  return (analytes ?? []).some(
    (analyte) => String(analyte.value_type || "").toUpperCase() === "NUMERIC",
  );
}
