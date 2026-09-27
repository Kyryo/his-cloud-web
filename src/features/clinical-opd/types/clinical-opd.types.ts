export type OpdQueueStage =
  | "registered"
  | "triaged"
  | "with_clinician"
  | "completed"
  | "cancelled";

export type AllergySeverity =
  | "mild"
  | "moderate"
  | "severe"
  | "life_threatening";

export type AllergyType =
  | "medication"
  | "latex"
  | "anesthetic"
  | "metal"
  | "food"
  | "environmental"
  | "other";

export type OpdQueueVital = {
  code: string;
  name: string;
  numeric_value: string | null;
  text_value: string;
  unit: string;
};

export type OpdQueueEncounter = {
  encounter_uuid: string;
  visit_uuid: string;
  visit_status: string;
  customer_uuid: string;
  customer_name: string;
  customer_identifier?: string | null;
  customer_gender?: string | null;
  customer_dob?: string | null;
  clinic_name?: string | null;
  department_name: string;
  status: string;
  started_at: string | null;
  mode_of_payment: "cash" | "insurance" | "free";
  insurance_scheme_name: string | null;
  queue_stage?: OpdQueueStage | string | null;
  triaged_at?: string | null;
  waiting_minutes?: number | null;
  latest_vitals?: OpdQueueVital[];
  allergy_count?: number | null;
  highest_allergy_severity?: AllergySeverity | null;
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
  signed_at?: string | null;
  signed_by_name?: string | null;
  amendment_of_uuid?: string | null;
  amendment_reason?: string;
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
  signed_at?: string | null;
  signed_by_name?: string | null;
  amendment_of_uuid?: string | null;
  amendment_reason?: string;
};

export type AllergyAlert = {
  allergy_name: string;
  severity: AllergySeverity | string;
  match: string;
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
  allergy_alerts?: AllergyAlert[];
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
  /** Laboratory LIS status when item_type is LABORATORY. */
  lab_status?: string | null;
  lab_status_display?: string | null;
  ordered_at: string | null;
  product: number | null;
  product_uuid: string | null;
  created_by_name: string | null;
  is_active: boolean;
  metadata?: Record<string, unknown> | null;
  allergy_alerts?: AllergyAlert[];
  referral_uuid?: string | null;
  referral_receiving_clinic_name?: string | null;
};

export type ClinicalReferralItem = {
  uuid: string;
  status: string;
  description: string;
  source_visit_order_uuid: string;
  receiving_visit_order_uuid: string | null;
  product_uuid: string | null;
  product_name: string | null;
  item_type: string;
  item_type_display: string;
};

export type ClinicalReferral = {
  uuid: string;
  service_type: string;
  status: string;
  notes: string;
  sent_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  referring_clinic_uuid: string;
  referring_clinic_name: string;
  receiving_clinic_uuid: string;
  receiving_clinic_name: string;
  referring_visit_uuid: string;
  referring_encounter_uuid: string;
  receiving_visit_uuid: string | null;
  receiving_encounter_uuid: string | null;
  customer_uuid: string;
  customer_name: string;
  customer_identifier: string | null;
  referred_by_name: string | null;
  awaiting_start: boolean;
  item_count: number;
  item_summaries: string[];
  mode_of_payment: "cash" | "insurance" | "free";
  insurance_scheme_uuid: string | null;
  insurance_scheme_name: string | null;
  requires_pre_authorization: boolean;
  pre_authorization_number: string;
  pre_authorization_comments: string;
  items: ClinicalReferralItem[];
};

export type StartClinicalReferralPayload = {
  mode_of_payment?: "cash" | "insurance" | "free";
  insurance_scheme_uuid?: string | null;
  requires_pre_authorization?: boolean;
  pre_authorization_number?: string;
  pre_authorization_comments?: string;
  notes?: string;
};

export type ReferralReceivingClinic = {
  uuid: string;
  name: string;
  code?: string;
};

export type EncounterLabResultAnalyte = {
  code: string;
  name: string;
  value_text: string;
  value_numeric: string | null;
  unit: string;
  flag: string | null;
};

export type EncounterLabResult = {
  order_uuid: string;
  item_uuid: string;
  /** Clinical visit-order line that produced this item, when known. */
  visit_order_uuid?: string | null;
  /** Product/panel name as ordered by the clinician. */
  ordered_name?: string | null;
  panel_uuid?: string | null;
  panel_code?: string | null;
  panel_name?: string | null;
  test_code: string;
  test_name: string;
  released_at: string | null;
  released_by_name?: string | null;
  analytes: EncounterLabResultAnalyte[];
};

export type ClinicalAllergy = {
  uuid: string;
  allergy_name: string;
  allergy_type: AllergyType | string;
  severity: AllergySeverity | string;
  reaction: string;
  notes?: string;
  date_identified?: string | null;
  verified_by_doctor?: boolean;
  is_active?: boolean;
};

export type ChartAllergy = {
  uuid: string;
  allergy_name: string;
  allergy_type: AllergyType | string;
  severity: AllergySeverity | string;
  reaction: string;
};

export type ChiefComplaint = {
  uuid: string;
  text: string;
  recorded_at: string;
  recorded_by_name: string | null;
  has_hpi: boolean;
  hpi?: HistoryOfPresentIllness | null;
};

export type ChiefComplaintSuggestion = {
  text: string;
  last_recorded_at: string;
  occurrence_count: number;
};

export type HistoryOfPresentIllness = {
  uuid: string;
  chief_complaint_uuid: string;
  body: string;
  recorded_at: string;
  recorded_by_name: string | null;
};

export type ProblemListItem = {
  uuid: string;
  code: string | null;
  standard: string | null;
  description: string;
  status: string;
  notes: string;
  recorded_at: string;
  resolved_at: string | null;
  recorded_by_name: string | null;
  source_diagnosis_uuid: string | null;
};

export type CurrentMedication = {
  uuid: string;
  product_uuid: string | null;
  name: string;
  dose: string;
  route: string;
  frequency: string;
  instructions: string;
  status: string;
  started_at: string;
  stopped_at: string | null;
  notes: string;
  recorded_by_name: string | null;
};

export type EncounterDisposition = {
  uuid: string;
  outcome: string;
  follow_up_at: string | null;
  notes: string;
  referral_destination: string;
  recorded_at: string;
  recorded_by_name: string | null;
  follow_up_appointment_uuid: string | null;
};

export type ChartLastChiefComplaint = {
  uuid: string;
  text: string;
  recorded_at: string;
  recorded_by_name: string | null;
  has_hpi: boolean;
};

export type OpdChartSummary = {
  allergies: ChartAllergy[];
  this_encounter_vitals: EncounterObservation[];
  last_vitals: EncounterObservation[];
  last_chief_complaints: ChartLastChiefComplaint[];
  last_hpis: HistoryOfPresentIllness[];
  last_encounter_uuid: string | null;
  open_orders: EncounterClinicalOrder[];
  investigation_orders: EncounterClinicalOrder[];
  problem_list: ProblemListItem[];
  current_medications: CurrentMedication[];
};

export type HistorySummaryEncounter = {
  encounter_uuid: string;
  visit_uuid: string;
  department: string | null;
  status: string;
  started_at: string | null;
};

export type EncounterHistorySummary = {
  recent_encounters: HistorySummaryEncounter[];
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
  kind:
    | "physical_exam"
    | "clinical_note"
    | "nursing_note"
    | "chief_complaint"
    | "hpi";
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
  observations?: EncounterObservation[];
  chief_complaints?: ChiefComplaint[];
  hpis?: HistoryOfPresentIllness[];
};

export type ClinicalRoleCapability = {
  uuid: string;
  user_role: string;
  capability: string;
};

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
  | "view_client_tab";

export type MyClinicalCapabilities = {
  capabilities: ClinicalCapabilityKey[];
};
