export type TenantDetail = {
  id: number;
  uuid: string;
  name: string;
  code: string;
  description: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state_province: string | null;
  country: string | null;
  postal_code: string | null;
  full_address: string | null;
  status: string;
  is_active: boolean;
  clinic_count: number;
  location_count: number;
  created_at: string;
  updated_at: string;
  created_by_username: string | null;
  updated_by_username: string | null;
};

export type UpdateProfilePayload = {
  firstName: string;
  lastName: string;
};

export type UpdateOrganizationContactPayload = {
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state_province?: string;
  country?: string;
  postal_code?: string;
};

export type OrganizationClinic = {
  id: number;
  uuid: string;
  name: string;
  code: string;
  status: string;
  is_active: boolean;
  location_count: number;
  operating_hours_display: string | null;
  created_at: string;
};

export type OrganizationLocation = {
  id: number;
  uuid: string;
  name: string;
  code: string;
  description?: string | null;
  clinic: number;
  clinic_name: string;
  clinic_code: string;
  status: string;
  is_active: boolean;
  operating_hours_display: string | null;
  created_at: string;
};

export type OrganizationListResponse<T> = {
  results: T[];
  pagination: {
    count: number;
    next: string | null;
    previous: string | null;
  } | null;
};

export type OrganizationService = {
  id: number;
  uuid: string;
  name: string;
  code: string;
  description: string;
  is_dentist_visit: boolean;
  is_walk_in_visit: boolean;
  is_consultation_visit: boolean;
  is_active: boolean;
  has_synced_to_odoo: boolean;
  created_at: string;
};

export type OrganizationPayer = {
  id: number;
  uuid: string;
  name: string;
  code: string;
  description: string;
  phone_number: string;
  email: string;
  address: string;
  is_active: boolean;
  created_at: string;
};

export type CreateOrganizationLocationPayload = {
  name: string;
  code: string;
  clinic: number;
  description?: string;
  status?: string;
  is_active?: boolean;
};

export type UpdateOrganizationClinicPayload = {
  name: string;
};

export type UpdateOrganizationLocationPayload = {
  name: string;
  code: string;
  clinic: number;
  description?: string;
};

export type UpdateOrganizationServicePayload = {
  name: string;
  code?: string;
  description?: string;
  is_dentist_visit?: boolean;
  is_walk_in_visit?: boolean;
  is_consultation_visit?: boolean;
};

export type CreateOrganizationServicePayload = {
  name: string;
  code?: string;
  description?: string;
  is_dentist_visit?: boolean;
  is_walk_in_visit?: boolean;
  is_consultation_visit?: boolean;
  is_active?: boolean;
};

export type CreateOrganizationPayerPayload = {
  name: string;
  code: string;
  description?: string;
  phone_number?: string;
  email?: string;
  address?: string;
  is_active?: boolean;
};

export type OrganizationPayerScheme = {
  id: number;
  uuid: string;
  insurance_company: number;
  insurance_company_name: string;
  name: string;
  code: string;
  description: string;
  pricelist_id: number | null;
  is_active: boolean;
  created_at: string;
};

export type CreateOrganizationPayerSchemePayload = {
  insurance_company: number;
  name: string;
  code: string;
  description?: string;
  pricelist_id?: number | null;
  create_corresponding_pricelist?: boolean;
  is_active?: boolean;
};

export type OrganizationTabId =
  | "general"
  | "clinics"
  | "locations"
  | "services"
  | "payers"
  | "schemes";
