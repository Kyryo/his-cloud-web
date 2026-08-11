import type { PaginatedListResponse } from "@/types/api.types";

export type ClaimStatus =
  | "draft"
  | "submitted"
  | "approved"
  | "rejected"
  | "cancelled"
  | string;

export type ClaimDiagnosis = {
  id: number;
  uuid: string;
  code: string;
  standard: string;
  description: string;
  created_at: string;
  updated_at: string;
};

export type ClaimLineItemDental = {
  id: number;
  tooth_number: number;
};

export type ClaimLineItem = {
  id: number;
  uuid: string;
  tariff_code: string;
  description?: string | null;
  unit_price: string;
  quantity: string;
  payer_due?: string | null;
  client_due?: string | null;
  total?: string | null;
  date_created: string;
  sales_order_line: number | null;
  is_procedure?: boolean;
  dental?: ClaimLineItemDental[];
  created_at: string;
  updated_at: string;
};

export type AdvisorFinding = {
  code: string;
  name: string;
  severity: "info" | "warning" | "rejection_risk" | string;
  category: string;
  message: string;
  recommended_action?: string;
  requires_ai_review?: boolean;
  evidence?: Record<string, unknown>;
};

export type AdvisorEvaluation = {
  id: number;
  public_id: string;
  claim: number;
  status: string;
  selected_validation_codes: string[];
  deterministic_findings: AdvisorFinding[];
  ai_findings: unknown[];
  deterministic_count: number;
  ai_count: number;
  evaluated_by: number | null;
  created_at: string;
};

export type ClaimAdvisoryOverride = {
  id: number;
  uuid: string;
  claim: number;
  note: string;
  created_by: number | null;
  created_at: string;
};

export type ClaimInvoice = {
  id: number;
  uuid: string;
  invoice_number: string;
  invoice_date: string;
  amount: string;
  currency: string;
  source_invoice: number;
  line_items: ClaimLineItem[];
  created_at: string;
  updated_at: string;
};

export type ClaimVitals = {
  height?: number | string | null;
  weight?: number | string | null;
  systolic_pressure?: number | string | null;
  diastolic_pressure?: number | string | null;
  [key: string]: unknown;
};

export type ClaimPayerStatus =
  | "awaiting_payer"
  | "processing"
  | "closed"
  | "failed"
  | "not_applicable"
  | string;

export type ClaimPayerReference = {
  status: ClaimPayerStatus;
  label: string;
  job_status?: string | null;
  portal_claim_id?: string | null;
  portal_url?: string | null;
  screenshot_url?: string | null;
  error_message?: string;
};

export type ClaimListItem = {
  id: number;
  uuid: string;
  status: ClaimStatus;
  payer_code: string;
  payer_status?: ClaimPayerStatus;
  payer_status_label?: string;
  membership_number: string;
  claim_reference_number: string | null;
  external_claim_id: string | null;
  customer_name: string;
  invoice_name: string;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ClaimDetail = {
  id: number;
  uuid: string;
  tenant: number;
  visit: number;
  visit_uuid: string;
  invoice: number;
  invoice_id: number;
  invoice_name?: string | null;
  payer_code: string;
  status: ClaimStatus;
  payer_status?: ClaimPayerStatus;
  payer_status_label?: string;
  payer_reference?: ClaimPayerReference | null;
  vitals: ClaimVitals;
  membership_number: string;
  practitioner_number: string;
  service_provider_code: string;
  verification_token: string;
  claim_reference_number: string | null;
  external_claim_id: string | null;
  customer_name?: string | null;
  customer_uuid?: string | null;
  submitted_at: string | null;
  created_by: number | null;
  submitted_by: number | null;
  diagnoses: ClaimDiagnosis[];
  claim_invoices: ClaimInvoice[];
  latest_advisor_evaluation?: AdvisorEvaluation | null;
  has_blocking_advisories?: boolean;
  has_advisory_override?: boolean;
  /** True when the visit has an active dental-department encounter. */
  has_dental_encounter?: boolean;
  created_at: string;
  updated_at: string;
};

export type ClaimListFilters = {
  page?: number;
  pageSize?: number;
  status?: string;
  search?: string;
  /** @deprecated Prefer `search`. Kept for older callers. */
  membershipNumber?: string;
};

export type ClaimListResponse = PaginatedListResponse<ClaimListItem>;

export type CreateClaimFromInvoicePayload = {
  verification_token?: string;
  payer_code?: string;
};

export type VerifyMemberPayload = {
  membership_number: string;
  service_provider_code: string;
  payer_code?: string;
};

export type VerifyMemberResponse = {
  token: string;
  member: Record<string, unknown>;
};

export type UpdateClaimPayload = {
  membership_number?: string;
  practitioner_number?: string;
  service_provider_code?: string;
  verification_token?: string;
  vitals?: ClaimVitals;
  diagnoses?: Array<{
    id: number;
    code?: string;
    standard?: string;
    description?: string;
  }>;
  line_items?: Array<{
    id: number;
    tariff_code?: string;
    unit_price?: string;
    quantity?: string;
  }>;
  invoices?: Array<{
    id: number;
    amount: string;
  }>;
};

export type MasmPayerIntegration = {
  uuid: string;
  tenant: number;
  clinic: number;
  payer_code: string;
  is_enabled: boolean;
  send_total_amount: boolean;
  client_key: string;
  client_secret?: string;
  has_client_secret?: boolean;
  sso_url: string;
  api_base_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type UpdateMasmPayerIntegrationPayload = {
  is_enabled?: boolean;
  send_total_amount?: boolean;
  client_key?: string;
  client_secret?: string;
  sso_url?: string;
  api_base_url?: string;
  is_active?: boolean;
};

export type MasmPortalCredential = {
  uuid: string;
  tenant: number;
  clinic: number;
  payer_code: string;
  operator_email: string;
  has_password?: boolean;
  is_enabled: boolean;
  is_active: boolean;
  last_connected_at: string | null;
  created_at: string;
  updated_at: string;
};

export type UpdateMasmPortalCredentialPayload = {
  operator_email?: string;
  password?: string;
  is_enabled?: boolean;
  is_active?: boolean;
};

export type EClaimMappingType = "scheme" | "specialist" | "ipd" | "dental";

export type EClaimPractitionerMapping = {
  id: number;
  uuid: string;
  tenant: number;
  clinic: number;
  mapping_type: EClaimMappingType;
  insurance_scheme: number | null;
  practitioner_number: string;
  service_provider_code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type UpsertEClaimPractitionerMappingPayload = {
  clinic?: number;
  mapping_type?: EClaimMappingType;
  insurance_scheme?: number | null;
  practitioner_number: string;
  service_provider_code: string;
  is_active?: boolean;
};

export type EClaimPractitionerMappingListResponse =
  PaginatedListResponse<EClaimPractitionerMapping>;

export type TariffCategory = {
  id: number;
  public_id: string;
  code: string;
  name: string;
  description: string;
  country_code: string;
  payer_code: string;
  scheme_code: string;
  service_group: string;
  quantity_policy: string;
  max_units_per_line: number | null;
  allowed_patient_genders: string[];
  min_age_years: number | null;
  max_age_years: number | null;
  is_active: boolean;
};

export type TariffCategoryListFilters = {
  search?: string;
  page?: number;
  pageSize?: number;
};

export type TariffCategoryListResponse =
  PaginatedListResponse<TariffCategory>;
