import type { ClinicalCapabilityKey } from "@/features/clinical-opd/types/clinical-opd.types";

export type ClinicalRoleCapabilityMeta = {
  key: ClinicalCapabilityKey;
  label: string;
};

export const CLINICAL_WORKSPACE_TAB_CAPABILITIES: ClinicalRoleCapabilityMeta[] = [
  { key: "view_vital_signs_tab", label: "Vital signs" },
  { key: "view_physical_examination_tab", label: "Physical examination" },
  { key: "view_orders_tab", label: "Orders" },
  { key: "view_diagnoses_tab", label: "Diagnoses" },
  { key: "view_medications_tab", label: "Medications" },
  { key: "view_activity_tab", label: "Activity" },
];

export const CLINICAL_ROLE_ACTION_CAPABILITIES: ClinicalRoleCapabilityMeta[] = [
  { key: "record_vitals", label: "Record vitals" },
  { key: "record_nursing_note", label: "Nursing notes" },
  { key: "order_laboratory", label: "Laboratory orders" },
  { key: "order_radiology", label: "Radiology orders" },
  { key: "order_procedure", label: "Procedure orders" },
  { key: "order_sundry", label: "Sundry orders" },
  { key: "order_medication", label: "Medication orders" },
  { key: "record_physical_exam", label: "Physical examination" },
  { key: "record_clinical_note", label: "Clinical notes" },
  { key: "manage_diagnoses", label: "Diagnoses" },
  { key: "prescribe", label: "Prescriptions" },
];
