import type { ClinicalCapabilityKey } from "@/features/clinical-opd/types/clinical-opd.types";

export type OpdEncounterTabId =
  | "overview"
  | "activity"
  | "vital-signs"
  | "nursing"
  | "allergies"
  | "complaint"
  | "physical-examination"
  | "notes"
  | "orders"
  | "diagnoses"
  | "problems"
  | "medications"
  | "disposition"
  | "client";

export type OpdEncounterTabGroupId =
  | "overview"
  | "nurse"
  | "consult"
  | "plan"
  | "record";

export type OpdEncounterTab = {
  id: OpdEncounterTabId;
  label: string;
  segment: string | null;
  group: OpdEncounterTabGroupId;
  requiredCapability: ClinicalCapabilityKey | ClinicalCapabilityKey[] | null;
};

export const OPD_ENCOUNTER_TAB_GROUPS: Array<{
  id: OpdEncounterTabGroupId;
  label: string | null;
}> = [
  { id: "overview", label: null },
  { id: "nurse", label: "Nurse" },
  { id: "consult", label: "Consult" },
  { id: "plan", label: "Plan" },
  { id: "record", label: "Record" },
];

export const OPD_ENCOUNTER_TABS: OpdEncounterTab[] = [
  {
    id: "overview",
    label: "Overview",
    segment: null,
    group: "overview",
    requiredCapability: null,
  },
  {
    id: "vital-signs",
    label: "Vitals",
    segment: "vital-signs",
    group: "nurse",
    requiredCapability: "view_vital_signs_tab",
  },
  {
    id: "nursing",
    label: "Nursing",
    segment: "nursing",
    group: "nurse",
    requiredCapability: "record_nursing_note",
  },
  {
    id: "allergies",
    label: "Allergies",
    segment: "allergies",
    group: "nurse",
    requiredCapability: "record_allergy",
  },
  {
    id: "complaint",
    label: "Complaint",
    segment: "complaint",
    group: "consult",
    requiredCapability: ["record_chief_complaint", "record_hpi"],
  },
  {
    id: "physical-examination",
    label: "Exam",
    segment: "physical-examination",
    group: "consult",
    requiredCapability: "view_physical_examination_tab",
  },
  {
    id: "notes",
    label: "Notes",
    segment: "notes",
    group: "consult",
    requiredCapability: "record_clinical_note",
  },
  {
    id: "diagnoses",
    label: "Diagnoses",
    segment: "diagnoses",
    group: "plan",
    requiredCapability: "view_diagnoses_tab",
  },
  {
    id: "problems",
    label: "Problems",
    segment: "problems",
    group: "plan",
    requiredCapability: "manage_problem_list",
  },
  {
    id: "medications",
    label: "Medications",
    segment: "medications",
    group: "plan",
    requiredCapability: "view_medications_tab",
  },
  {
    id: "orders",
    label: "Orders",
    segment: "orders",
    group: "plan",
    requiredCapability: "view_orders_tab",
  },
  {
    id: "disposition",
    label: "Disposition",
    segment: "disposition",
    group: "plan",
    requiredCapability: "record_disposition",
  },
  {
    id: "activity",
    label: "Activity",
    segment: "activity",
    group: "record",
    requiredCapability: "view_activity_tab",
  },
  {
    id: "client",
    label: "Client",
    segment: "client",
    group: "record",
    requiredCapability: "view_client_tab",
  },
];

const TAB_SEGMENTS = new Set(
  OPD_ENCOUNTER_TABS.flatMap((tab) => (tab.segment ? [tab.segment] : [])),
);

export function opdEncounterTabHref(
  visitUuid: string,
  encounterUuid: string,
  tabId: OpdEncounterTabId = "overview",
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
    return "overview";
  }

  const segment = pathname.slice(prefix.length).replace(/^\//, "").split("/")[0];
  if (!segment) {
    return "overview";
  }

  if (!TAB_SEGMENTS.has(segment)) {
    return "overview";
  }

  const tab = OPD_ENCOUNTER_TABS.find((item) => item.segment === segment);
  return tab?.id ?? "overview";
}

function tabIsVisible(tab: OpdEncounterTab, capabilities: string[]) {
  if (tab.requiredCapability === null) {
    return true;
  }
  if (Array.isArray(tab.requiredCapability)) {
    return tab.requiredCapability.some((capability) =>
      capabilities.includes(capability),
    );
  }
  return capabilities.includes(tab.requiredCapability);
}

export function getVisibleOpdEncounterTabs(capabilities: string[]) {
  return OPD_ENCOUNTER_TABS.filter((tab) => tabIsVisible(tab, capabilities));
}

export function getVisibleOpdEncounterTabGroups(capabilities: string[]) {
  const visibleTabs = getVisibleOpdEncounterTabs(capabilities);
  return OPD_ENCOUNTER_TAB_GROUPS.flatMap((group) => {
    const tabs = visibleTabs.filter((tab) => tab.group === group.id);
    if (tabs.length === 0) {
      return [];
    }
    return [{ ...group, tabs }];
  });
}

export function getDefaultOpdEncounterTab(
  capabilities: string[],
  userRole?: string | null,
): OpdEncounterTabId {
  const visibleTabs = getVisibleOpdEncounterTabs(capabilities);
  if (visibleTabs.some((tab) => tab.id === "overview")) {
    return "overview";
  }
  if (visibleTabs.length === 0) {
    return "overview";
  }

  const preferredTabByRole: Record<string, OpdEncounterTabId> = {
    nurse: "vital-signs",
    physician: "complaint",
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

export function isOpdEncounterLocked(status?: string | null) {
  return status === "completed" || status === "cancelled";
}
