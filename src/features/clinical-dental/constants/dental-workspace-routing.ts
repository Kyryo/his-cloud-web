import { getClinicalSpecialty } from "@/features/clinical-workspace/constants/clinical-specialties";
import type {
  ClinicalWorkspaceRouting,
  ClinicalWorkspaceTab,
} from "@/features/clinical-workspace/types/clinical-workspace.types";

export type DentalEncounterTabId =
  | "overview"
  | "activity"
  | "complaint"
  | "notes"
  | "orders"
  | "treatment"
  | "medications"
  | "physical-examination"
  | "dental-chart"
  | "treatment-plan"
  | "diagnoses"
  | "vital-signs"
  | "allergies"
  | "dental-history"
  | "disposition"
  | "client";

/** The consult flow in chair-side order; records sit in the header menu. */
export const DENTAL_ENCOUNTER_TABS: ClinicalWorkspaceTab<DentalEncounterTabId>[] = [
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
    id: "notes",
    label: "Notes",
    segment: "notes",
    group: "consult",
    surface: "tab",
    requiredCapability: "record_clinical_note",
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
    id: "treatment",
    label: "Treatment",
    segment: "treatment",
    group: "consult",
    surface: "tab",
    requiredCapability: ["perform_dental_procedure", "view_treatment_plan_tab"],
  },
  {
    id: "medications",
    label: "Medications",
    segment: "medications",
    group: "consult",
    surface: "tab",
    requiredCapability: "view_medications_tab",
  },
  {
    id: "physical-examination",
    label: "Exam",
    segment: "physical-examination",
    group: "consult",
    surface: "menu",
    requiredCapability: "view_physical_examination_tab",
  },
  {
    id: "dental-chart",
    label: "Dental chart",
    segment: "dental-chart",
    group: "consult",
    surface: "menu",
    requiredCapability: "view_dental_chart_tab",
  },
  {
    id: "treatment-plan",
    label: "Treatment plan",
    segment: "treatment-plan",
    group: "consult",
    surface: "menu",
    requiredCapability: "view_treatment_plan_tab",
  },
  {
    id: "diagnoses",
    label: "Diagnoses",
    segment: "diagnoses",
    group: "consult",
    surface: "menu",
    requiredCapability: "view_diagnoses_tab",
  },
  {
    id: "vital-signs",
    label: "Vital signs",
    segment: "vital-signs",
    group: "nurse",
    surface: "menu",
    requiredCapability: "view_vital_signs_tab",
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
    id: "dental-history",
    label: "Dental history",
    segment: "dental-history",
    group: "record",
    surface: "menu",
    requiredCapability: "view_dental_history_tab",
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
  {
    id: "overview",
    label: "Chart summary",
    segment: "summary",
    group: "record",
    surface: "menu",
    requiredCapability: null,
  },
];

export const DENTAL_WORKSPACE_ROUTING: ClinicalWorkspaceRouting<DentalEncounterTabId> =
  {
    specialty: getClinicalSpecialty("dental"),
    encounterNoun: "dental encounter",
    tabs: DENTAL_ENCOUNTER_TABS,
    consultLayoutTabIds: new Set<DentalEncounterTabId>([
      "complaint",
      "notes",
      "orders",
      "treatment",
      "medications",
      "physical-examination",
      "diagnoses",
      "vital-signs",
    ]),
    fullWidthTabIds: new Set<DentalEncounterTabId>([
      "activity",
      "dental-chart",
      "treatment-plan",
      "dental-history",
    ]),
    preferredTabsByRole: {
      dentist: ["activity", "treatment"],
      nurse: ["activity", "vital-signs"],
    },
    fallbackTabId: "overview",
  };

/** History-column sections added by the dental workspace. */
export const DENTAL_HISTORY_SECTION_IDS = {
  chartFindings: "chart-findings",
  procedures: "procedures",
} as const;

/** Right-pane history chips for dental consult tabs (order preserved). */
export const DENTAL_HISTORY_ALLOWED_SECTIONS = [
  "complaint",
  "notes",
  "orders",
  DENTAL_HISTORY_SECTION_IDS.procedures,
  "medications",
] as const;
