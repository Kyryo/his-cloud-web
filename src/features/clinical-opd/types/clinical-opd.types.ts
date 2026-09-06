export type OpdQueueEncounter = {
  encounter_uuid: string;
  visit_uuid: string;
  visit_status: string;
  customer_uuid: string;
  customer_name: string;
  customer_identifier?: string | null;
  clinic_name?: string | null;
  department_name: string;
  status: string;
  started_at: string | null;
  mode_of_payment: "cash" | "insurance";
  insurance_scheme_name: string | null;
};

export type ObservationDefinition = {
  uuid: string;
  code: string;
  name: string;
  category: string;
  value_type: string;
  default_unit: string;
  display_order: number;
};

export type EncounterObservation = {
  uuid: string;
  definition_code: string;
  definition_name: string;
  numeric_value: string | null;
  text_value: string;
  unit: string;
  recorded_at: string;
  recorded_by_name: string | null;
};

export type EncounterNursingNote = {
  uuid: string;
  body: string;
  recorded_at: string;
  recorded_by_name: string | null;
};

export type EncounterPhysicalExam = {
  uuid: string;
  section: string;
  system_code: string;
  findings: string;
  recorded_at: string;
  recorded_by_name: string | null;
};

export type EncounterClinicalNote = {
  uuid: string;
  body: string;
  recorded_at: string;
  recorded_by_name: string | null;
};

export type EncounterPrescription = {
  uuid: string;
  product_uuid: string;
  product_name: string;
  dose: string;
  route: string;
  frequency: string;
  duration: string;
  quantity: string;
  clinical_uom: string;
  charge_quantity: string;
  instructions: string;
  is_prn: boolean;
  clinical_notes: string;
  status: string;
  visit_order_uuid: string | null;
  prescribed_by_name: string | null;
};

export type EncounterClinicalOrder = {
  uuid: string;
  item_type: string;
  item_type_display: string;
  description: string;
  clinical_quantity: string;
  clinical_uom: string;
  charge_quantity: string;
  quantity: string;
  status: string;
  status_display: string;
  ordered_at: string | null;
  product: number | null;
  product_uuid: string | null;
  created_by_name: string | null;
  is_active: boolean;
};

export type ClinicalTimelineEvent = {
  type: string;
  occurred_at: string;
  summary: string;
  actor: string | null;
  object_uuid: string;
};

export type ClinicalHistoryVisit = {
  visit_uuid: string;
  encounter_uuid: string;
  visit_date: string | null;
  department: string | null;
  status: string;
  started_at: string | null;
  ended_at: string | null;
};

export type ClinicalHistoryNote = {
  kind: "physical_exam" | "clinical_note" | "nursing_note";
  uuid: string;
  title: string;
  body: string;
  occurred_at: string | null;
  recorded_by_name: string | null;
};

export type ClinicalVisitHistory = {
  visits: ClinicalHistoryVisit[];
  selected_visit_uuid: string | null;
  selected_encounter_uuid: string | null;
  notes: ClinicalHistoryNote[];
  orders: EncounterClinicalOrder[];
  diagnoses: Array<{
    uuid: string;
    code: string;
    description: string;
    status: string;
    is_primary: boolean;
    created_at: string;
  }>;
  medications: EncounterPrescription[];
};

export type ClinicalRoleCapability = {
  uuid: string;
  user_role: string;
  capability: string;
};

export type ClinicalCapabilityKey =
  | "record_vitals"
  | "order_laboratory"
  | "order_radiology"
  | "order_procedure"
  | "order_sundry"
  | "order_medication"
  | "prescribe"
  | "record_nursing_note"
  | "record_physical_exam"
  | "record_clinical_note"
  | "manage_diagnoses"
  | "view_vital_signs_tab"
  | "view_physical_examination_tab"
  | "view_orders_tab"
  | "view_diagnoses_tab"
  | "view_medications_tab"
  | "view_activity_tab"
  | "view_client_tab";

export type MyClinicalCapabilities = {
  capabilities: ClinicalCapabilityKey[];
};
