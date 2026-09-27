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
  | "investigation-results"
  | "diagnoses"
  | "problems"
  | "medications"
  | "disposition"
  | "client";

export type OpdEncounterTabGroupId = "nurse" | "consult" | "record";

/**
 * `tab` sections sit in the encounter tab bar. `menu` sections keep their route
 * but are reached from the header overflow menu so the consult flow stays to
 * five steps.
 */
export type OpdEncounterTabSurface = "tab" | "menu";

export type OpdEncounterTab = {
  id: OpdEncounterTabId;
  label: string;
  segment: string;
  group: OpdEncounterTabGroupId;
  surface: OpdEncounterTabSurface;
  requiredCapability: ClinicalCapabilityKey | ClinicalCapabilityKey[] | null;
};

/**
 * Activity first (shared by nurses and physicians), then the consult flow in
 * the order clinicians work. Remaining sections stay reachable from the
 * header menu.
 */
export const OPD_ENCOUNTER_TABS: OpdEncounterTab[] = [
  {
    id: "activity",
    label: "Activity",
    segment: "activity",
    group: "record",
    surface: "tab",
    requiredCapability: "view_activity_tab",
  },
  {
    id: "complaint",
    label: "Complaints & HPI",
    segment: "complaint",
    group: "consult",
    surface: "tab",
    requiredCapability: ["record_chief_complaint", "record_hpi"],
  },
  {
    id: "physical-examination",
    label: "Exam",
    segment: "physical-examination",
    group: "consult",
    surface: "tab",
    requiredCapability: "view_physical_examination_tab",
  },
  {
    id: "orders",
    label: "Orders",
    segment: "orders",
    group: "consult",
    surface: "tab",
    requiredCapability: "view_orders_tab",
  },
  {
    id: "investigation-results",
    label: "Investigation results",
    segment: "investigation-results",
    group: "consult",
    surface: "tab",
    requiredCapability: "view_investigation_results_tab",
  },
  {
    id: "diagnoses",
    label: "Diagnoses",
    segment: "diagnoses",
    group: "consult",
    surface: "tab",
    requiredCapability: "view_diagnoses_tab",
  },
  {
    id: "medications",
    label: "Medication",
    segment: "medications",
    group: "consult",
    surface: "tab",
    requiredCapability: "view_medications_tab",
  },
  {
    id: "vital-signs",
    label: "Vital signs",
    segment: "vital-signs",
    group: "consult",
    surface: "tab",
    requiredCapability: "view_vital_signs_tab",
  },
  {
    id: "nursing",
    label: "Nurse's notes",
    segment: "nursing",
    group: "consult",
    surface: "tab",
    requiredCapability: "view_nursing_notes_tab",
  },
  {
    id: "allergies",
    label: "Allergies",
    segment: "allergies",
    group: "nurse",
    surface: "menu",
    requiredCapability: "record_allergy",
  },
  {
    id: "overview",
    label: "Chart summary",
    segment: "chart",
    group: "record",
    surface: "menu",
    requiredCapability: null,
  },
  {
    id: "notes",
    label: "Clinical notes",
    segment: "notes",
    group: "record",
    surface: "menu",
    requiredCapability: "record_clinical_note",
  },
  {
    id: "problems",
    label: "Problem list",
    segment: "problems",
    group: "record",
    surface: "menu",
    requiredCapability: "manage_problem_list",
  },
  {
    id: "disposition",
    label: "Disposition",
    segment: "disposition",
    group: "record",
    surface: "menu",
    requiredCapability: "record_disposition",
  },
  {
    id: "client",
    label: "Client",
    segment: "client",
    group: "record",
    surface: "menu",
    requiredCapability: "view_client_tab",
  },
];

const TABS_BY_SEGMENT = new Map(
  OPD_ENCOUNTER_TABS.map((tab) => [tab.segment, tab]),
);

/** Sections laid out as form / content / previous-visit history columns. */
const CONSULT_TAB_IDS = new Set<OpdEncounterTabId>(
  OPD_ENCOUNTER_TABS.filter((tab) => tab.group === "consult").map(
    (tab) => tab.id,
  ),
);

export function isOpdConsultTab(tabId: OpdEncounterTabId): boolean {
  return CONSULT_TAB_IDS.has(tabId);
}

export function opdEncounterLandingHref(
  visitUuid: string,
  encounterUuid: string,
  capabilities: string[],
  userRole?: string | null,
) {
  return opdEncounterTabHref(
    visitUuid,
    encounterUuid,
    getDefaultOpdEncounterTab(capabilities, userRole),
  );
}

export function opdEncounterTabHref(
  visitUuid: string,
  encounterUuid: string,
  tabId: OpdEncounterTabId,
): string {
  const tab = OPD_ENCOUNTER_TABS.find((item) => item.id === tabId);
  if (!tab) {
    return `/clinical/opd/${visitUuid}/${encounterUuid}`;
  }
  return `/clinical/opd/${visitUuid}/${encounterUuid}/${tab.segment}`;
}

/**
 * Returns `null` for the bare encounter URL, which redirects to the role's
 * default tab rather than rendering a section of its own.
 */
export function opdEncounterTabFromPathname(
  pathname: string,
  visitUuid: string,
  encounterUuid: string,
): OpdEncounterTabId | null {
  const prefix = `/clinical/opd/${visitUuid}/${encounterUuid}`;
  if (pathname !== prefix && !pathname.startsWith(`${prefix}/`)) {
    return null;
  }

  const segment = pathname.slice(prefix.length).replace(/^\//, "").split("/")[0];
  if (!segment) {
    return null;
  }
  return TABS_BY_SEGMENT.get(segment)?.id ?? null;
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

/** Every section the user may open, including header-menu ones. */
export function getVisibleOpdEncounterSections(capabilities: string[]) {
  return OPD_ENCOUNTER_TABS.filter((tab) => tabIsVisible(tab, capabilities));
}

/** Sections rendered in the tab bar. */
export function getVisibleOpdEncounterTabs(capabilities: string[]) {
  return getVisibleOpdEncounterSections(capabilities).filter(
    (tab) => tab.surface === "tab",
  );
}

/** Sections rendered in the header overflow menu. */
export function getVisibleOpdEncounterMenuSections(capabilities: string[]) {
  return getVisibleOpdEncounterSections(capabilities).filter(
    (tab) => tab.surface === "menu",
  );
}

export function getDefaultOpdEncounterTab(
  capabilities: string[],
  userRole?: string | null,
): OpdEncounterTabId {
  const visibleSections = getVisibleOpdEncounterSections(capabilities);
  const visibleTabs = getVisibleOpdEncounterTabs(capabilities);

  if (visibleSections.length === 0) {
    return "overview";
  }

  const preferredTabsByRole: Record<string, OpdEncounterTabId[]> = {
    nurse: ["activity", "vital-signs"],
    physician: ["activity", "complaint"],
  };
  const preferredTabs = userRole ? preferredTabsByRole[userRole] : undefined;
  if (preferredTabs) {
    for (const preferredTab of preferredTabs) {
      if (
        visibleSections.some((section) => section.id === preferredTab)
      ) {
        return preferredTab;
      }
    }
  }

  return visibleTabs[0]?.id ?? visibleSections[0].id;
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
