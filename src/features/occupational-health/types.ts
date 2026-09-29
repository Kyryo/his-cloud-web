export type OhVisitEncounter = {
  id: number;
  uuid: string;
  visit: string;
  department: string;
  department_name: string;
  department_type: string;
  location: string | null;
  location_name: string | null;
  clinician: number | null;
  clinician_name: string | null;
  customer_uuid?: string;
  customer_name?: string;
  customer_identifier?: string;
  status: string;
  billing_mode: string | null;
  started_at: string | null;
  ended_at: string | null;
  notes: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type OhEmployer = {
  id: number;
  uuid: string;
  name: string;
  code: string;
  registration_number?: string;
};

export type OhJobTitle = {
  id: number;
  uuid: string;
  title: string;
  code: string;
  employer: number | null;
  employer_name?: string | null;
};

export type OhEmployerSite = {
  id: number;
  uuid: string;
  name: string;
  code: string;
  address: string;
  employer: number;
  employer_name?: string;
};

export type OhHazard = {
  id: number;
  uuid: string;
  code: string;
  name: string;
  description: string;
};

export type OhHazardProfile = {
  id: number;
  uuid: string;
  name: string;
  code: string;
  hazards?: number[];
};

export type EmploymentEpisode = {
  id: number;
  uuid: string;
  customer: number;
  employer: number;
  job_title: number;
  site: string;
  department_name: string;
  employment_type: "employee" | "contractor" | string;
  employee_number: string;
  start_date: string;
  end_date: string | null;
  requires_fitness: boolean;
  hazard_profile: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type OhExamType =
  | "pre_employment"
  | "periodic"
  | "transfer"
  | "rtw"
  | "post_incident"
  | "exit";

export type OhExamination = {
  id: number;
  uuid: string;
  encounter: number;
  employment_episode: number | null;
  exam_type: OhExamType | string;
  occupational_attendance: boolean;
  template_code: string;
  notes: string;
  examined_at: string | null;
  encounter_department_type?: string;
  created_at: string;
  updated_at: string;
};

export type OhExamFinding = {
  id: number;
  uuid: string;
  examination: number;
  code: string;
  numeric_value: string | null;
  coded_value: string;
  unit: string;
  recorded_at: string;
  threshold_flag: "none" | "watch" | "alert" | string;
};

export type FitnessOutcome =
  | "fit"
  | "fit_with_restrictions"
  | "temporarily_unfit"
  | "permanently_unfit"
  | "unfit"
  | "deferred";

export type FitnessAssessment = {
  id: number;
  uuid: string;
  examination: number;
  outcome: FitnessOutcome | string;
  assessed_at: string;
  review_date: string | null;
  clinician: number;
};

export type IodCase = {
  id: number;
  uuid: string;
  customer: number;
  employment_episode: number | null;
  encounter: number | null;
  she_reference: string;
  severity: string;
  lost_days: number;
  status: string;
  onset_date: string;
  mechanism: string;
  body_part: string;
  incident_location: string;
  safety_classification: string;
  work_related: boolean;
  description: string;
  created_at: string;
  updated_at: string;
};

export type OhComplianceDashboard = {
  due: number;
  overdue: number;
  completed: number;
  waived: number;
  open_episodes: number;
  due_within_30_days: number;
  fitness_validity_alerts: number;
};

export type SurveillanceRequirement = {
  id: number;
  uuid: string;
  employment_episode: number;
  exam_battery_rule: number;
  due_date: string;
  status: "due" | "overdue" | "completed" | "waived" | string;
  completed_examination: number | null;
  customer_uuid?: string;
  customer_name?: string;
  customer_identifier?: string;
  site?: string;
  department_name?: string;
  job_title?: string;
  employer?: string;
  component_code?: string;
  exam_type?: string;
  hazard_id?: number | null;
  hazard_profile_id?: number | null;
  created_at: string;
  updated_at: string;
};

export type OhCampaignQueueRow = {
  customer_uuid: string;
  customer_identifier: string;
  customer_name: string;
  employer: string;
  job_title: string;
  site: string;
  department_name?: string;
  component_code: string;
  exam_type: string;
  due_date: string;
  status: string;
};

export type OhFitnessValidityAlert = {
  employment_episode_uuid: string;
  customer_uuid: string;
  customer_identifier: string;
  customer_name: string;
  employer: string;
  job_title: string;
  site: string;
  alert_codes: string[];
  review_date: string | null;
  certificate_valid_to: string | null;
  latest_outcome: string | null;
};

export type FitnessCertificate = {
  id: number;
  uuid: string;
  assessment: number;
  version: number;
  status: "issued" | "amended" | "withdrawn" | string;
  valid_from: string;
  valid_to: string | null;
  signed_at: string | null;
  signed_by: number | null;
  payload: Record<string, unknown>;
  previous_certificate: number | null;
  created_at: string;
  updated_at: string;
};

export type OhImmunisation = {
  id: number;
  uuid: string;
  customer: number;
  vaccine_code: string;
  administered_at: string | null;
  expiry_date: string | null;
  status: string;
  notes: string;
  created_at: string;
  updated_at: string;
};

export type PpeFitTest = {
  id: number;
  uuid: string;
  customer: number;
  ppe_type: string;
  tested_at: string | null;
  expiry_date: string | null;
  status: string;
  notes: string;
  created_at: string;
  updated_at: string;
};

export type FoodHandlerClearance = {
  id: number;
  uuid: string;
  customer: number;
  cleared_at: string | null;
  expiry_date: string | null;
  status: string;
  notes: string;
  created_at: string;
  updated_at: string;
};

export type SickLeaveCertificate = {
  id: number;
  uuid: string;
  customer: number;
  encounter: number | null;
  days: number;
  expected_return: string | null;
  issued_at: string;
  clinician: number;
  created_at: string;
  updated_at: string;
};

export type OhHrFitnessRestriction = {
  code: string | null;
  description: string;
  valid_until: string | null;
};

export type OhHrFitnessCertificate = {
  uuid: string;
  status: string;
  valid_from: string;
  valid_to: string | null;
  signed_at: string | null;
  payload: Record<string, unknown>;
};

export type OhHrFitnessRow = {
  assessment_uuid: string;
  outcome: string;
  assessed_at: string;
  review_date?: string | null;
  clinician_id: number;
  restrictions: OhHrFitnessRestriction[];
  certificate: OhHrFitnessCertificate | null;
};
