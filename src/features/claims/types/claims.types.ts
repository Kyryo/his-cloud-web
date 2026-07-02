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

export type ClaimLineItem = {
  id: number;
  uuid: string;
  tariff_code: string;
  unit_price: string;
  quantity: string;
  date_created: string;
  sales_order_line: number | null;
  created_at: string;
  updated_at: string;
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

export type ClaimListItem = {
  id: number;
  uuid: string;
  status: ClaimStatus;
  payer_code: string;
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
  payer_code: string;
  status: ClaimStatus;
  vitals: ClaimVitals;
  membership_number: string;
  practitioner_number: string;
  service_provider_code: string;
  verification_token: string;
  claim_reference_number: string | null;
  external_claim_id: string | null;
  submitted_at: string | null;
  created_by: number | null;
  submitted_by: number | null;
  diagnoses: ClaimDiagnosis[];
  claim_invoices: ClaimInvoice[];
  created_at: string;
  updated_at: string;
};

export type ClaimListFilters = {
  page?: number;
  pageSize?: number;
  status?: string;
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
  payer_code: string;
  is_enabled: boolean;
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
  client_key?: string;
  client_secret?: string;
  sso_url?: string;
  api_base_url?: string;
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
