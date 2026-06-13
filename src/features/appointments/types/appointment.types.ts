export type AppointmentStatus =
  | "scheduled"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "no_show"
  | "rescheduled";

export type Appointment = {
  id: number;
  uuid: string;
  patient: string;
  patient_name: string;
  clinic: string;
  clinic_name: string;
  department: string;
  department_name: string;
  department_type: string;
  location: string | null;
  location_name: string | null;
  clinician: number | null;
  clinician_name: string | null;
  scheduled_start: string;
  scheduled_end: string;
  status: AppointmentStatus;
  reason: string;
  notes: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CreateAppointmentPayload = {
  patient: string;
  clinic: string;
  department: string;
  location?: string | null;
  clinician?: number | null;
  scheduled_start: string;
  scheduled_end: string;
  reason?: string;
  notes?: string;
};

export type FetchAppointmentsOptions = {
  page?: number;
  pageSize?: number;
  search?: string;
  patient?: string;
  clinic?: string;
  department?: string;
  status?: AppointmentStatus;
};

export type StartAppointmentVisitPayload = {
  consultation_service?: string | null;
  mode_of_payment?: "cash" | "insurance";
  insurance_scheme?: string | null;
};

export type AppointmentAction = "confirm" | "cancel" | "no-show" | "start";
