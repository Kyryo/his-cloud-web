import { getClinicalSpecialty } from "@/features/clinical-workspace/constants/clinical-specialties";
import type {
  ClinicalWorkspaceRouting,
  ClinicalWorkspaceTab,
} from "@/features/clinical-workspace/types/clinical-workspace.types";

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

export type OpdEncounterTab = ClinicalWorkspaceTab<OpdEncounterTabId>;

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

/** Tabs that use the form / content / previous-visit layout. */
export const OPD_CONSULT_LAYOUT_TAB_IDS: ReadonlySet<OpdEncounterTabId> = new Set([
  "complaint",
  "physical-examination",
  "orders",
  "investigation-results",
  "diagnoses",
  "medications",
  "nursing",
  "vital-signs",
]);

export const OPD_WORKSPACE_ROUTING: ClinicalWorkspaceRouting<OpdEncounterTabId> = {
  specialty: getClinicalSpecialty("opd"),
  encounterNoun: "OPD encounter",
  tabs: OPD_ENCOUNTER_TABS,
  consultLayoutTabIds: OPD_CONSULT_LAYOUT_TAB_IDS,
  // Activity uses a client-style main + aside grid and needs full width.
  fullWidthTabIds: new Set<OpdEncounterTabId>(["activity"]),
  preferredTabsByRole: {
    nurse: ["activity", "vital-signs"],
    physician: ["activity", "complaint"],
  },
  fallbackTabId: "overview",
};
