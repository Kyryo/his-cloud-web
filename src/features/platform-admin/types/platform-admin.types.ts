export type PlatformAdminPagination = {
  count: number;
  next: string | null;
  previous: string | null;
} | null;

export type PlatformAdminListResponse<T> = {
  results: T[];
  pagination: PlatformAdminPagination;
};

export type PlatformAdminDashboard = {
  total_tenants: number;
  active_tenants: number;
  suspended_tenants: number;
  pending_tenants: number;
  total_clinics: number;
  total_locations: number;
  total_products: number;
  total_users: number;
  active_users: number;
};

export type PlatformAdminTenantStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "SUSPENDED"
  | "PENDING";

export type PlatformAdminTenant = {
  id: number;
  uuid: string;
  name: string;
  code: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state_province: string;
  country: string;
  postal_code: string;
  full_address: string;
  branding_logo_url: string;
  branding_primary_color: string;
  branding_secondary_color: string;
  branding_accent_color: string;
  status: PlatformAdminTenantStatus;
  is_active: boolean;
  allow_dental_group_clinical_notes: boolean;
  currency_code: string;
  customer_identifier_prefix: string;
  customer_identifier_digits: number;
  customer_identifier_separator: string;
  customer_identifier_suffix: string;
  customer_identifier_start_number: number;
  clinic_count: number;
  location_count: number;
  product_count: number;
  user_count: number;
  active_user_count: number;
  created_at: string;
  updated_at: string;
};

export type PlatformAdminTenantPayload = Pick<
  PlatformAdminTenant,
  | "name"
  | "code"
  | "description"
  | "email"
  | "phone"
  | "address"
  | "city"
  | "state_province"
  | "country"
  | "postal_code"
  | "status"
  | "is_active"
  | "currency_code"
>;

export type PlatformAdminClinic = {
  id: number;
  uuid: string;
  tenant: number;
  tenant_name: string;
  name: string;
  code: string;
  status: string;
  is_active: boolean;
  city: string;
  country: string;
  location_count: number;
  created_at: string;
  updated_at: string;
};

export type PlatformAdminDepartment = {
  id: number;
  uuid: string;
  tenant: number;
  clinic: number;
  clinic_name: string;
  name: string;
  code: string;
  department_type: string;
  status: string;
  is_active: boolean;
};

export type PlatformAdminLocation = {
  id: number;
  uuid: string;
  tenant: number;
  clinic: number;
  clinic_name: string;
  department: number;
  department_name: string;
  name: string;
  code: string;
  status: string;
  is_active: boolean;
};

export type PlatformAdminUser = {
  id: number;
  name: string;
  email: string;
  tenant: number;
  tenant_name: string;
  is_admin: boolean;
  is_active: boolean;
  user_role: string;
  date_joined: string;
  last_login: string | null;
  last_login_display: string;
};

export type PlatformAdminTenantConfiguration = {
  branding_logo_url: string;
  branding_primary_color: string;
  branding_secondary_color: string;
  branding_accent_color: string;
  currency_code: string;
  customer_identifier_prefix: string;
  customer_identifier_digits: number;
  customer_identifier_separator: string;
  customer_identifier_suffix: string;
  customer_identifier_start_number: number;
  allow_dental_group_clinical_notes: boolean;
  lab_catalog_id: number | null;
  radiology_catalog_id: number | null;
  procedure_catalogue: number | null;
};

export type PlatformAdminAuditEvent = {
  id: number;
  uuid: string;
  action: string;
  category: string;
  message: string;
  status: string;
  actor: number | null;
  actor_email: string;
  target_model: string;
  target_label: string;
  source: string;
  request_id: string;
  metadata: Record<string, unknown>;
  changes: Record<string, unknown>;
  created_at: string;
};
