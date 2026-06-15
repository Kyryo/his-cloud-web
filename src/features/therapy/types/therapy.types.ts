export const THERAPY_DISCIPLINES = [
  "speech",
  "physio",
  "occupational",
] as const;

export type TherapyDiscipline = (typeof THERAPY_DISCIPLINES)[number];

export type TherapyVisitStatus =
  | "not_started"
  | "active"
  | "completed"
  | "cancelled";

export type TherapyEncounter = {
  uuid: string;
  department: string;
  department_name: string;
  department_type: TherapyDiscipline;
  location: string | null;
  location_name: string | null;
  clinician_name: string | null;
  status: "waiting" | "in_progress" | "completed" | "cancelled";
  started_at: string | null;
  ended_at: string | null;
};

export type TherapyVisit = {
  uuid: string;
  appointment: string | null;
  consultation_service: string | null;
  consultation_service_name: string | null;
  customer: string;
  customer_name: string;
  customer_identifier: string;
  customer_age: number | null;
  customer_gender: string;
  visit_date: string;
  status: TherapyVisitStatus;
  mode_of_payment: "cash" | "insurance";
  is_walk_in: boolean;
  clinic: string;
  clinic_name: string;
  encounters: TherapyEncounter[];
};

export type TherapyDepartment = {
  uuid: string;
  name: string;
  code: string;
  clinic: number;
  department_type: TherapyDiscipline;
  clinic_name: string;
  status: string;
  is_active: boolean;
};

export type TherapyVisitListResponse = {
  results: TherapyVisit[];
  pagination: {
    count: number;
    next: string | null;
    previous: string | null;
  } | null;
};

export type TherapyTreatmentPlan = {
  uuid: string;
  title: string;
  diagnosis: string;
  diagnosis_code: string;
  status: "draft" | "active" | "on_hold" | "completed" | "discontinued";
  total_sessions_planned: number;
  sessions_completed: number;
  start_date: string | null;
  expected_end_date: string | null;
  actual_end_date: string | null;
  discharge_summary: string;
};

export type TherapyGoalUnit =
  | "degrees"
  | "cm"
  | "meters"
  | "seconds"
  | "repetitions"
  | "numeric"
  | "percentage"
  | "boolean"
  | "custom";

export type TherapyTreatmentGoal = {
  uuid: string;
  treatment_plan: string;
  description: string;
  unit: TherapyGoalUnit;
  unit_custom_label: string;
  baseline_value: string | null;
  target_value: string | null;
  target_date: string | null;
  boolean_value: boolean | null;
  is_achieved: boolean;
  achieved_at: string | null;
  notes: string;
  current_value: number | null;
  progress_percentage: number | null;
  progress_logs: TherapyGoalProgress[];
};

export type TherapyGoalProgress = {
  uuid: string;
  measured_value: string;
  notes: string;
  created_at: string;
};

export type TherapyVisitTreatmentGoals = {
  appointment_uuid: string | null;
  encounter_uuid: string;
  treatment_plan: TherapyTreatmentPlan | null;
  available_treatment_plans: TherapyTreatmentPlan[];
  linkable_treatment_plans: TherapyTreatmentPlan[];
  goals: TherapyTreatmentGoal[];
};

export type TherapyPatientResponse =
  | ""
  | "excellent"
  | "good"
  | "fair"
  | "poor"
  | "deteriorated";

export type TherapySession = {
  uuid: string;
  encounter: string;
  treatment_plan: string;
  session_number: number;
  date: string;
  duration_minutes: number;
  subjective_complaint: string | null;
  objective_findings: string | null;
  patient_response: TherapyPatientResponse | null;
  assessment_notes: string;
  plan_for_next_session: string | null;
  is_final_session: boolean;
  created_at?: string | null;
  updated_at?: string | null;
  created_by_name?: string | null;
};

export type TherapySessionPayload = {
  date: string;
  duration_minutes: number;
  subjective_complaint: string | null;
  objective_findings: string | null;
  patient_response: TherapyPatientResponse | null;
  assessment_notes: string;
  plan_for_next_session: string | null;
  is_final_session: boolean;
};

export type TherapyAssessment = {
  uuid: string;
  assessment_notes: string;
  visit_encounter_id: string;
  assessment_goalplan_id: string;
  created_by_name: string | null;
  created_at: string;
  updated_at: string;
};

export type TherapySessionActivity = {
  uuid: string;
  session_uuid: string;
  session_number: number;
  activity_uuid: string;
  name: string;
  category: string;
  description: string;
  instructions: string;
  precautions: string;
  sets: number | null;
  reps: number | null;
  duration_seconds: number | null;
  resistance_or_level: string;
  cues_provided: string;
  performance_notes: string;
  is_home_program: boolean;
  created_at: string;
};

export type TherapySessionOption = {
  uuid: string;
  session_number: number;
  date: string;
};

export type TherapyPerformanceNoteOption = {
  value: string;
  label: string;
};

export type TherapySessionActivitiesResponse = {
  results: TherapySessionActivity[];
  session_options: TherapySessionOption[];
  performance_note_options: TherapyPerformanceNoteOption[];
};

export type TherapySessionActivityPayload = {
  session_uuid: string;
  name: string;
  category: string;
  description: string;
  instructions: string;
  precautions: string;
  sets: number | null;
  reps: number | null;
  duration_seconds: number | null;
  resistance_or_level: string;
  cues_provided: string;
  performance_notes: string;
  is_home_program: boolean;
};

export type CreateTherapyTreatmentGoalPayload = {
  description: string;
  unit: TherapyGoalUnit;
  unit_custom_label?: string;
  baseline_value?: string | null;
  target_value?: string | null;
  target_date?: string | null;
  notes?: string;
};

export type AssignTherapyTreatmentPlanPayload = {
  treatment_plan_uuid?: string;
  linked_treatment_plan_uuid?: string;
  treatment_plan?: {
    title: string;
    diagnosis: string;
    diagnosis_code: string;
    total_sessions_planned: number;
    start_date: string | null;
    expected_end_date: string | null;
    actual_end_date: string | null;
  };
};

export type TherapyFutureAppointment = {
  uuid: string;
  department_name: string;
  department_type: TherapyDiscipline | string;
  clinician_name: string | null;
  location_name: string | null;
  scheduled_start: string;
  scheduled_end: string;
  status: string;
  reason: string;
};
