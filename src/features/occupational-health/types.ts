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
  employer_name?: string | null;
  hazard_profile_name?: string | null;
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
  is_active?: boolean;
};

export type OhJobTitle = {
  id: number;
  uuid: string;
  title: string;
  code: string;
  employer: number | null;
  employer_name?: string | null;
  /** Linked risk (hazard) profile id. */
  hazard_profile?: number | null;
  hazard_profile_name?: string | null;
  hazard_profile_code?: string | null;
  is_active?: boolean;
};

export type OhEmployerSite = {
  id: number;
  uuid: string;
  name: string;
  code: string;
  address: string;
  employer: number;
  employer_name?: string;
  is_active?: boolean;
};

export type OhEmployerDepartment = {
  id: number;
  uuid: string;
  name: string;
  code: string;
  employer: number;
  employer_name?: string;
  is_active?: boolean;
};

export type OhHazard = {
  id: number;
  uuid: string;
  code: string;
  name: string;
  description: string;
  is_active?: boolean;
};

export type OhAssessmentIntervalUnit = "day" | "week" | "month" | "year";

export type OhHazardProfile = {
  id: number;
  uuid: string;
  name: string;
  code: string;
  color?: string;
  assessment_interval?: number | null;
  assessment_interval_unit?: OhAssessmentIntervalUnit | string;
  employer: number | null;
  employer_name?: string | null;
  hazards?: number[];
  /** Attached COF template UUID (tenant-scoped). */
  cof_template?: string | null;
  cof_template_name?: string | null;
  cof_template_code?: string | null;
  /** Attached exam template UUID (tenant-scoped). */
  exam_template?: string | null;
  exam_template_name?: string | null;
  exam_template_code?: string | null;
  is_active?: boolean;
};

export type OhJobProfile = {
  id: number;
  uuid: string;
  name: string;
  code: string;
  employer: number | null;
  employer_name?: string | null;
  hazards?: number[];
  critical_activities?: number[];
  is_active?: boolean;
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
  job_profile: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type OhRequirementsProcedure = {
  code: string;
  requirement: "mandatory" | "conditional" | "optional" | string;
  repeat_months?: number;
};

export type OhRequirementsMatrixRow = {
  exam_type: string;
  job_profile_code: string | null;
  procedures: OhRequirementsProcedure[];
};

export type OhRequirementsConfig = {
  schema_version?: number;
  matrix: OhRequirementsMatrixRow[];
  critical_activities?: Array<{
    code: string;
    requirement?: "mandatory" | "conditional" | "optional" | string;
  }>;
};

export type OhCatalogItemType =
  | "exam_type"
  | "critical_activity"
  | "procedure"
  | "hazard"
  | "analyte"
  | "instrument"
  | "option_list"
  | string;

export type OhCatalogPossibleResponse = {
  code: string;
  label: string;
};

export type OhCatalogSelectionMode = "exclusive" | "inclusive";

export type OhCatalogScheduleUnit = "day" | "week" | "month" | "year";

export type OhCatalogScheduleRow = {
  /** How many units between occurrences. */
  interval: number;
  unit: OhCatalogScheduleUnit;
  notes?: string;
  /**
   * @deprecated Prefer `interval` + `unit`. Kept for reading older rows that
   * only stored months.
   */
  interval_months?: number;
  /** @deprecated Free-text label replaced by `unit`. */
  label?: string;
};

export type OhCatalogItemAttributes = {
  possible_responses?: OhCatalogPossibleResponse[];
  selection_mode?: OhCatalogSelectionMode;
  is_mandatory?: boolean;
  schedule?: OhCatalogScheduleRow[];
  [key: string]: unknown;
};

export type OhCatalogItem = {
  id: number;
  uuid: string;
  section: string;
  item_type: OhCatalogItemType;
  code: string;
  names_i18n: Record<string, string>;
  attributes_json?: OhCatalogItemAttributes;
  active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type OhCatalogSystemRole =
  | "exam_type"
  | "hazard"
  | "procedure"
  | "critical_activity"
  | "";

export type OhCatalogSectionKey =
  | "exam_type"
  | "hazard"
  | "procedure"
  | "critical_activity"
  | string;

export type OhCatalogSection = {
  id: number;
  uuid: string;
  code: string;
  name: string;
  system_role: OhCatalogSystemRole | string;
  is_mandatory: boolean;
  selection_mode: OhCatalogSelectionMode;
  sort_order: number;
  active: boolean;
  is_system?: boolean;
};

/** @deprecated Use OhCatalogSection */
export type OhCatalogSectionRule = OhCatalogSection;

export type OhLibrarySectionKind = "cof" | "exam";

export type OhLibraryContentMode = "items" | "direct";

export type OhResponseConfigOption = {
  code: string;
  label: string;
};

export type OhResponseConfigValidation = {
  min?: number;
  max?: number;
  min_length?: number;
  max_length?: number;
};

export type OhResponseConfig = {
  response_type: string;
  options: OhResponseConfigOption[];
  validation: OhResponseConfigValidation;
  /** When false, selecting an item records the choice only (no nested Yes/No). */
  prompt_after_select: boolean;
};

/** Reusable template library section (COF or exam). */
export type OhLibrarySection = {
  id: number;
  uuid: string;
  kind: OhLibrarySectionKind;
  code: string;
  name: string;
  content_mode: OhLibraryContentMode;
  default_response_config: OhResponseConfig;
  selection_mode: OhCatalogSelectionMode;
  is_mandatory: boolean;
  sort_order: number;
  active: boolean;
  item_count?: number;
  created_at?: string;
  updated_at?: string;
};

export type OhLibrarySectionItem = {
  id: number;
  uuid: string;
  section: string;
  code: string;
  names_i18n: Record<string, string>;
  override_response_config: OhResponseConfig | null;
  inherits_response_config?: boolean;
  effective_response_config?: OhResponseConfig;
  sort_order: number;
  active: boolean;
  created_at?: string;
  updated_at?: string;
};

/** @deprecated Use OhLibrarySection */
export type OhExamSection = OhLibrarySection;

/** @deprecated Use OhLibrarySectionItem */
export type OhExamSectionItem = OhLibrarySectionItem;

export type OhTemplateVersionStatus =
  | "draft"
  | "in_review"
  | "published"
  | "retired"
  | string;

export type OhCofTemplateVersion = {
  id: number;
  uuid: string;
  template: string;
  number: number;
  status: OhTemplateVersionStatus;
  snapshot_json: Record<string, unknown>;
  content_hash: string;
  published_at: string | null;
  published_by: number | null;
  created_at?: string;
  updated_at?: string;
};

export type OhExamTemplateVersion = OhCofTemplateVersion;

export type OhCofTemplate = {
  id: number;
  uuid: string;
  name: string;
  code: string;
  active: boolean;
  section_count?: number;
  published_version_number?: number | null;
  published_version_status?: OhTemplateVersionStatus | null;
  created_at?: string;
  updated_at?: string;
};

/** Attachment of a reusable library section onto a COF template. */
export type OhCofTemplateSection = {
  id: number;
  uuid: string;
  template: string;
  library_section: string;
  library_section_detail?: OhLibrarySection;
  sort_order: number;
  active: boolean;
  item_count?: number;
};

export type OhExamTemplate = {
  id: number;
  uuid: string;
  name: string;
  code: string;
  active: boolean;
  section_count?: number;
  published_version_number?: number | null;
  published_version_status?: OhTemplateVersionStatus | null;
  created_at?: string;
  updated_at?: string;
};

/** Attachment of a reusable library section onto an exam template. */
export type OhExamTemplateSection = {
  id: number;
  uuid: string;
  template: string;
  library_section: string;
  library_section_detail?: OhLibrarySection;
  sort_order: number;
  active: boolean;
  item_count?: number;
};

export type OhPaginatedList<T> = {
  results: T[];
  pagination: {
    count: number;
    next: string | null;
    previous: string | null;
  } | null;
};

export type OhProcedureRecord = {
  id: number;
  uuid: string;
  examination: number;
  procedure_code: string;
  requirement: "mandatory" | "conditional" | "optional" | string;
  status: "outstanding" | "performed" | "waived" | string;
  performed_at: string | null;
  notes: string;
  abnormal: boolean;
  repeat_months: number | null;
};

export type OhExamType =
  | "pre_employment"
  | "periodic"
  | "transfer"
  | "rtw"
  | "post_incident"
  | "exit";

export type OhFormFieldOption = {
  value: string;
  label: { en?: string; [locale: string]: string | undefined };
};

export type OhFormField = {
  key: string;
  type: "choice" | "boolean" | "string" | "text" | "datetime" | "number" | "date" | string;
  label?: { en?: string; [locale: string]: string | undefined };
  required?: boolean;
  options?: OhFormFieldOption[];
  visible_when?: Record<string, unknown>;
  required_when?: Record<string, unknown>;
};

export type OhFormSection = {
  key: string;
  title?: { en?: string; [locale: string]: string | undefined };
  fields: OhFormField[];
};

export type OhFormSchema = {
  schema_version?: number;
  sections?: OhFormSection[];
  computed?: Array<Record<string, unknown> & { key: string; op: string }>;
};

export type OhPublishedFormConfig = {
  programme_code: string | null;
  programme_version_uuid: string | null;
  programme_version_number: number | null;
  content_hash: string | null;
  form: OhFormSchema;
  form_engine_enabled: boolean;
};

export type OhExamination = {
  id: number;
  uuid: string;
  encounter: number;
  employment_episode: number | null;
  programme_version?: number | null;
  exam_type: OhExamType | string;
  occupational_attendance: boolean;
  template_code: string;
  notes: string;
  examined_at: string | null;
  responses_json?: Record<string, unknown>;
  schema_hash?: string;
  row_version?: number;
  form_schema?: OhFormSchema | null;
  checklist_complete?: boolean;
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

export type OhHistoryVisit = {
  visit_uuid: string;
  encounter_uuid: string;
  visit_date: string | null;
  department: string | null;
  status: string;
  started_at: string | null;
  ended_at: string | null;
};

export type OhVisitHistory = {
  visits: OhHistoryVisit[];
  selected_visit_uuid: string | null;
  selected_encounter_uuid: string | null;
  examinations: OhExamination[];
  findings: OhExamFinding[];
  fitness_assessments: FitnessAssessment[];
  fitness_certificates: FitnessCertificate[];
  iod_cases: IodCase[];
};

export type OhProgramme = {
  id: number;
  uuid: string;
  name: string;
  code: string;
  employer: number | null;
  published_version: number | null;
  published_version_uuid?: string | null;
  published_version_number?: number | null;
  is_active: boolean;
};

export type OhProgrammeVersion = {
  id: number;
  uuid: string;
  programme: number;
  programme_uuid?: string;
  number: number;
  status: "draft" | "in_review" | "published" | "retired" | string;
  effective_from: string | null;
  published_at: string | null;
  content_hash: string;
  config_json: Record<string, unknown>;
};

export type OhFeatureFlag = {
  id: number;
  uuid: string;
  key: string;
  enabled: boolean;
};
