import type { ClinicalCapabilityKey } from "@/features/clinical-opd/types/clinical-opd.types";

export type OpdEncounterTabId =
  | "vital-signs"
  | "physical-examination"
  | "orders"
  | "diagnoses"
  | "medications"
  | "activity";

export type OpdEncounterTab = {
  id: OpdEncounterTabId;
  label: string;
  segment: string | null;
  requiredCapability: ClinicalCapabilityKey;
};

export const OPD_ENCOUNTER_TABS: OpdEncounterTab[] = [
  {
    id: "vital-signs",
    label: "Vital signs",
    segment: null,
    requiredCapability: "view_vital_signs_tab",
  },
  {
    id: "physical-examination",
    label: "Physical examination",
    segment: "physical-examination",
    requiredCapability: "view_physical_examination_tab",
  },
  {
    id: "orders",
    label: "Orders",
    segment: "orders",
    requiredCapability: "view_orders_tab",
  },
  {
    id: "diagnoses",
    label: "Diagnoses",
    segment: "diagnoses",
    requiredCapability: "view_diagnoses_tab",
  },
  {
    id: "medications",
    label: "Medications",
    segment: "medications",
    requiredCapability: "view_medications_tab",
  },
  {
    id: "activity",
    label: "Activity",
    segment: "activity",
    requiredCapability: "view_activity_tab",
  },
];

const TAB_SEGMENTS = new Set(
  OPD_ENCOUNTER_TABS.flatMap((tab) => (tab.segment ? [tab.segment] : [])),
);

export function opdEncounterTabHref(
  visitUuid: string,
  encounterUuid: string,
  tabId: OpdEncounterTabId = "vital-signs",
): string {
  const tab = OPD_ENCOUNTER_TABS.find((item) => item.id === tabId);
  if (!tab?.segment) {
    return `/clinical/opd/${visitUuid}/${encounterUuid}`;
  }
  return `/clinical/opd/${visitUuid}/${encounterUuid}/${tab.segment}`;
}

export function opdEncounterTabFromPathname(
  pathname: string,
  visitUuid: string,
  encounterUuid: string,
): OpdEncounterTabId {
  const prefix = `/clinical/opd/${visitUuid}/${encounterUuid}`;
  if (pathname !== prefix && !pathname.startsWith(`${prefix}/`)) {
    return "vital-signs";
  }

  const segment = pathname.slice(prefix.length).replace(/^\//, "").split("/")[0];
  if (!segment) {
    return "vital-signs";
  }

  if (!TAB_SEGMENTS.has(segment)) {
    return "vital-signs";
  }

  const tab = OPD_ENCOUNTER_TABS.find((item) => item.segment === segment);
  return tab?.id ?? "vital-signs";
}

export function getVisibleOpdEncounterTabs(capabilities: string[]) {
  return OPD_ENCOUNTER_TABS.filter((tab) =>
    capabilities.includes(tab.requiredCapability),
  );
}

export function getDefaultOpdEncounterTab(
  capabilities: string[],
  userRole?: string | null,
): OpdEncounterTabId {
  const visibleTabs = getVisibleOpdEncounterTabs(capabilities);
  if (visibleTabs.length === 0) {
    return "vital-signs";
  }

  const preferredTabByRole: Record<string, OpdEncounterTabId> = {
    nurse: "vital-signs",
    physician: "physical-examination",
  };
  const preferredTab = userRole ? preferredTabByRole[userRole] : undefined;
  if (preferredTab && visibleTabs.some((tab) => tab.id === preferredTab)) {
    return preferredTab;
  }

  if (userRole === "physician") {
    const nonVitalsTab = visibleTabs.find((tab) => tab.id !== "vital-signs");
    if (nonVitalsTab) {
      return nonVitalsTab.id;
    }
  }

  return visibleTabs[0].id;
}

export function hasClinicalCapability(
  capabilities: string[],
  capability: ClinicalCapabilityKey,
) {
  return capabilities.includes(capability);
}
