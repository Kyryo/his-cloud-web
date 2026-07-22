export type VisitEncounter = {
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
  status: string;
  started_at: string | null;
  ended_at: string | null;
  notes: string;
  is_active: boolean;
  created_by: number | null;
  created_at: string;
  updated_at: string;
};

export type VisitDetail = {
  id: number;
  uuid: string;
  appointment: string | null;
  consultation_service: string | null;
  consultation_service_name: string | null;
  customer: string;
  customer_name: string;
  customer_identifier: string;
  visit_date: string;
  status: string;
  mark_for_completion: boolean;
  mode_of_payment: "cash" | "insurance";
  insurance_scheme: string | null;
  insurance_scheme_name: string | null;
  linked_sales_order_state: string | null;
  can_edit_mode_of_payment: boolean;
  mode_of_payment_edit_block_reason: string | null;
  can_reopen_visit?: boolean;
  reopen_block_reason?: string | null;
  requires_pre_authorization: boolean;
  pre_authorization_number: string;
  pre_authorization_comments: string;
  is_walk_in: boolean;
  is_active: boolean;
  clinic: string | null;
  clinic_name: string | null;
  closed_by: number | null;
  created_by: number | null;
  created_by_name: string | null;
  created_by_email?: string | null;
  encounters: VisitEncounter[];
  created_at: string;
  updated_at: string;
};

export type ConsultationServiceCatalogItem = {
  id: number;
  uuid: string;
  name: string;
  code: string;
  is_chargable: boolean;
  is_active: boolean;
};

export type CreateVisitPayload = {
  consultation_service?: string | null;
  customer: string;
  clinic?: string | null;
  department: string;
  location?: string | null;
  clinician?: number | null;
  visit_date?: string;
  mode_of_payment: "cash" | "insurance";
  insurance_scheme?: string | null;
  requires_pre_authorization?: boolean;
  pre_authorization_number?: string;
  pre_authorization_comments?: string;
  is_walk_in?: boolean;
};

export type StartVisitFromAppointmentPayload = {
  consultation_service?: string | null;
  mode_of_payment?: "cash" | "insurance";
  insurance_scheme?: string | null;
};

export type UpdateVisitPaymentModePayload = {
  mode_of_payment: "cash" | "insurance";
  insurance_scheme?: string | null;
};

export type UpdateVisitPreAuthorizationPayload = {
  requires_pre_authorization: boolean;
  pre_authorization_number: string;
  pre_authorization_comments: string;
};

export type VisitEncounterCreatePayload = {
  department: string;
  location?: string | null;
  clinician?: number | null;
  notes?: string;
};

export type FetchVisitsOptions = {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  isActive?: boolean;
  customerUuid?: string;
  clinic?: string;
};

export type FetchCustomerVisitsOptions = {
  limit?: number;
};
