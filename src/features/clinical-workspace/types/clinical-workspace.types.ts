import type { ComponentType } from "react";

import type {
  ClinicalSpecialtyCode,
  ClinicalSpecialtyDefinition,
} from "@/features/clinical-workspace/constants/clinical-specialties";

export type ClinicalCapabilityKey =
  | "record_vitals"
  | "record_nursing_note"
  | "record_physical_exam"
  | "record_clinical_note"
  | "record_chief_complaint"
  | "record_hpi"
  | "prescribe"
  | "order_laboratory"
  | "order_radiology"
  | "order_procedure"
  | "order_sundry"
  | "order_medication"
  | "manage_diagnoses"
  | "manage_problem_list"
  | "manage_current_medications"
  | "record_allergy"
  | "record_disposition"
  | "refer_clinical_orders"
  | "view_vital_signs_tab"
  | "view_physical_examination_tab"
  | "view_orders_tab"
  | "view_diagnoses_tab"
  | "view_medications_tab"
  | "view_nursing_notes_tab"
  | "view_investigation_results_tab"
  | "view_activity_tab"
  | "view_client_tab"
  | "record_dental_chart"
  | "manage_treatment_plan"
  | "perform_dental_procedure"
  | "view_dental_chart_tab"
  | "view_treatment_plan_tab"
  | "view_dental_history_tab";

export type ClinicalWorkspaceTabGroup = "nurse" | "consult" | "record";

/**
 * `tab` sections sit in the encounter tab bar. `menu` sections keep their
 * route but are reached from the header overflow menu.
 */
export type ClinicalWorkspaceTabSurface = "tab" | "menu";

export type ClinicalWorkspaceTab<TabId extends string = string> = {
  id: TabId;
  label: string;
  segment: string;
  group: ClinicalWorkspaceTabGroup;
  surface: ClinicalWorkspaceTabSurface;
  requiredCapability: ClinicalCapabilityKey | ClinicalCapabilityKey[] | null;
};

export type ClinicalWorkspacePanelProps = {
  visitUuid: string;
  encounterUuid: string;
  isActive: boolean;
};

export type ClinicalWorkspaceHistorySectionProps = {
  visitUuid: string;
  encounterUuid: string;
  /** Earlier encounter selected in the history column; null for the latest. */
  historyEncounterUuid: string | null;
};

/** A specialty-specific section shown in the previous-visit history column. */
export type ClinicalWorkspaceHistorySection = {
  id: string;
  label: string;
  Component: ComponentType<ClinicalWorkspaceHistorySectionProps>;
};

/** Tabs, routes, and layout rules of a specialty workspace (no components). */
export type ClinicalWorkspaceRouting<TabId extends string = string> = {
  specialty: ClinicalSpecialtyDefinition;
  /** Singular noun used in copy, e.g. "OPD encounter". */
  encounterNoun: string;
  tabs: readonly ClinicalWorkspaceTab<TabId>[];
  /** Tabs laid out as form / this visit / previous-visit history columns. */
  consultLayoutTabIds: ReadonlySet<TabId>;
  /** Tabs rendered edge to edge instead of in the narrow main column. */
  fullWidthTabIds: ReadonlySet<TabId>;
  /** Preferred landing tabs per user role, tried in order. */
  preferredTabsByRole: Readonly<Record<string, readonly TabId[]>>;
  /** Tab used when the user can see no other section. */
  fallbackTabId: TabId;
};

/** Everything a specialty supplies to run in the shared EMR workspace. */
export type ClinicalWorkspaceConfig<TabId extends string = string> =
  ClinicalWorkspaceRouting<TabId> & {
    panels: Readonly<Record<TabId, ComponentType<ClinicalWorkspacePanelProps>>>;
    historySections?: readonly ClinicalWorkspaceHistorySection[];
    /**
     * Built-in and specialty history section ids shown in the right pane.
     * Order is preserved. When omitted, physician defaults apply and every
     * specialty section is appended.
     */
    historyAllowedSections?: readonly string[];
  };

export type ClinicalSpecialtySummary = {
  code: ClinicalSpecialtyCode;
  label: string;
  department_types: string[];
  access_group: string;
  portal_module: string;
  queue_enabled: boolean;
  is_enabled: boolean;
  has_access: boolean;
};

export type ClinicalDepartmentTypeOption = {
  value: string;
  label: string;
  specialty_code: ClinicalSpecialtyCode | null;
  is_clinical: boolean;
};

export type ClinicalSpecialtyCatalog = {
  specialties: ClinicalSpecialtySummary[];
  department_types: ClinicalDepartmentTypeOption[];
};

/** A department the user belongs to, with its specialty and queue size. */
export type ClinicalMemberDepartment = {
  uuid: string;
  name: string;
  code: string;
  department_type: string;
  clinic_uuid: string;
  clinic_name: string;
  specialty_code: ClinicalSpecialtyCode;
  specialty_label: string;
  waiting_count: number;
};
