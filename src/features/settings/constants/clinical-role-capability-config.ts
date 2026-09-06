import type { ClinicalCapabilityKey } from "@/features/clinical-opd/types/clinical-opd.types";

export type ClinicalRoleCapabilityMeta = {
  key: ClinicalCapabilityKey;
  label: string;
  description: string;
};

export const CLINICAL_WORKSPACE_TAB_CAPABILITIES: ClinicalRoleCapabilityMeta[] = [
  {
    key: "view_activity_tab",
    label: "Activity",
    description: "Visit timeline and recent events",
  },
  {
    key: "view_vital_signs_tab",
    label: "Vital signs",
    description: "Recorded vitals for the visit",
  },
  {
    key: "view_physical_examination_tab",
    label: "Physical examination",
    description: "Exam findings on the visit",
  },
  {
    key: "view_orders_tab",
    label: "Orders",
    description: "Labs, imaging, and other orders",
  },
  {
    key: "view_diagnoses_tab",
    label: "Diagnoses",
    description: "Diagnoses recorded for the visit",
  },
  {
    key: "view_medications_tab",
    label: "Medications",
    description: "Active and prescribed medications",
  },
  {
    key: "view_client_tab",
    label: "Client",
    description: "Client profile in the visit workspace",
  },
];

export const CLINICAL_ROLE_ACTION_CAPABILITIES: ClinicalRoleCapabilityMeta[] = [
  {
    key: "record_vitals",
    label: "Record vitals",
    description: "Enter vital signs during a visit",
  },
  {
    key: "record_nursing_note",
    label: "Nursing notes",
    description: "Write nursing notes on the visit",
  },
  {
    key: "order_laboratory",
    label: "Laboratory orders",
    description: "Place laboratory orders",
  },
  {
    key: "order_radiology",
    label: "Radiology orders",
    description: "Place radiology orders",
  },
  {
    key: "order_procedure",
    label: "Procedure orders",
    description: "Place procedure orders",
  },
  {
    key: "order_sundry",
    label: "Sundry orders",
    description: "Place sundry and supply orders",
  },
  {
    key: "order_medication",
    label: "Medication orders",
    description: "Place medication orders",
  },
  {
    key: "record_physical_exam",
    label: "Physical examination",
    description: "Record exam findings",
  },
  {
    key: "record_clinical_note",
    label: "Clinical notes",
    description: "Write clinician notes on the visit",
  },
  {
    key: "manage_diagnoses",
    label: "Diagnoses",
    description: "Add or update visit diagnoses",
  },
  {
    key: "prescribe",
    label: "Prescriptions",
    description: "Create and manage prescriptions",
  },
];
