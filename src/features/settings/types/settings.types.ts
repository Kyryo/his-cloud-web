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
  department: number;
  department_name: string;
  department_type?: string;
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
  is_chargable: boolean;
  is_active: boolean;
  product: number | null;
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

export type OrganizationDepartment = {
  id: number;
  uuid: string;
  clinic: number;
  clinic_name: string;
  name: string;
  code: string;
  department_type: string;
  description: string;
  status: string;
  is_active: boolean;
  requires_appointment: boolean;
  walk_in_allowed: boolean;
  default_appointment_duration_minutes: number;
  created_at: string;
  updated_at: string;
};

export type CreateOrganizationDepartmentPayload = {
  name: string;
  code: string;
  clinic: number;
  department_type: string;
  description?: string;
  status?: string;
  is_active?: boolean;
  requires_appointment?: boolean;
  walk_in_allowed?: boolean;
  default_appointment_duration_minutes?: number;
};

export type UpdateOrganizationDepartmentPayload = {
  name: string;
  code: string;
  clinic: number;
  department_type: string;
  description?: string;
  status?: string;
  is_active?: boolean;
  requires_appointment?: boolean;
  walk_in_allowed?: boolean;
  default_appointment_duration_minutes?: number;
};

export type CreateOrganizationLocationPayload = {
  name: string;
  code: string;
  clinic: number;
  department: number;
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
  department: number;
  description?: string;
};

export type UpdateOrganizationServicePayload = {
  name: string;
  code?: string;
  description?: string;
  is_chargable?: boolean;
};

export type CreateOrganizationServicePayload = {
  name: string;
  code?: string;
  description?: string;
  is_chargable?: boolean;
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

export type OrganizationPricelist = {
  uuid: string;
  name: string;
  is_active: boolean;
  currency_code: string;
};

export type CreateOrganizationPricelistPayload = {
  name: string;
  is_active?: boolean;
  currency_code?: string;
};

export type UpdateOrganizationPricelistPayload = {
  name?: string;
  is_active?: boolean;
  currency_code?: string;
};

export type OrganizationDefaultPricelist = {
  tenant_uuid: string;
  default_pricelist_uuid: string | null;
};

export type SetOrganizationDefaultPricelistPayload = {
  default_pricelist_uuid: string | null;
};

export type TenantBranding = {
  branding_logo_url: string;
  branding_primary_color: string;
  branding_secondary_color: string;
  branding_accent_color: string;
};

export type UpdateTenantBrandingPayload = Partial<TenantBranding>;

export type TenantCurrency = {
  tenant_id: number;
  currency_code: string;
  default_pricelist_id: number | null;
};

export type UpdateTenantCurrencyPayload = {
  currency_code: string;
};

export type OrganizationTabId =
  | "general"
  | "branding"
  | "departments"
  | "clinics"
  | "locations";

export type UserManagementTabId = "users" | "groups";

export type OrganizationUserRole =
  | ""
  | "nurse"
  | "physician"
  | "pharmacist"
  | "billing"
  | "housekeeping"
  | "admin"
  | "other";

export type AssociationRole = "admin" | "manager" | "staff" | "viewer";

export type OrganizationUser = {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
  is_active: boolean;
  user_role?: OrganizationUserRole;
  groups: string[];
  primary_clinic: {
    id: number;
    name: string;
    code: string;
  } | null;
};

export type OrganizationUserDetail = OrganizationUser & {
  user_role: OrganizationUserRole;
};

export type UserClinicAssociation = {
  id: number;
  user: number;
  user_name: string;
  user_email: string;
  clinic: {
    id: number;
    name: string;
    code: string;
    tenant_name?: string;
  };
  role: AssociationRole;
  is_primary: boolean;
  is_active: boolean;
};

export type UserLocationAssociation = {
  id: number;
  user: number;
  user_name: string;
  user_email: string;
  location: {
    id: number;
    name: string;
    code: string;
    clinic_name?: string;
  };
  clinic_name: string;
  role: AssociationRole;
  is_primary: boolean;
  is_active: boolean;
};

export type OrganizationGroup = {
  id: number;
  name: string;
};

export type OrganizationGroupMember = {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  is_admin: boolean;
};

export type OrganizationGroupDetail = OrganizationGroup & {
  users: OrganizationGroupMember[];
};

export type CreateOrganizationUserPayload = {
  name: string;
  email: string;
  password: string;
};

export type UpdateOrganizationUserPayload = {
  name?: string;
  email?: string;
  password?: string;
  user_role?: OrganizationUserRole;
  is_admin?: boolean;
};

export type CreateUserClinicAssociationPayload = {
  user: number;
  clinic_id: number;
  role?: AssociationRole;
  is_primary?: boolean;
};

export type UpdateUserClinicAssociationPayload = {
  role?: AssociationRole;
  is_primary?: boolean;
};

export type CreateUserLocationAssociationPayload = {
  user: number;
  location_id: number;
  role?: AssociationRole;
  is_primary?: boolean;
};

export type UpdateUserLocationAssociationPayload = {
  role?: AssociationRole;
  is_primary?: boolean;
};

export type CreateOrganizationGroupPayload = {
  name: string;
};

export type UpdateOrganizationGroupPayload = {
  name: string;
};

export type GroupMembershipPayload = {
  user_id: number;
  group_id: number;
};

export type FinanceOperationsTabId = "payers" | "schemes" | "pricelists";

export type TenantEmailConfiguration = {
  id: number;
  tenant: number;
  is_active: boolean;
  appointment_emails_enabled: boolean;
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  use_tls: boolean;
  use_ssl: boolean;
  timeout: number;
  sender_name: string;
  from_email: string;
  reply_to: string;
  has_smtp_password: boolean;
  created_at: string;
  updated_at: string;
  created_by: number | null;
  updated_by: number | null;
};

export type CreateTenantEmailConfigurationPayload = {
  is_active?: boolean;
  appointment_emails_enabled?: boolean;
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  use_tls?: boolean;
  use_ssl?: boolean;
  timeout?: number;
  sender_name: string;
  from_email: string;
  reply_to?: string;
};

export type UpdateTenantEmailConfigurationPayload = {
  is_active?: boolean;
  appointment_emails_enabled?: boolean;
  smtp_host?: string;
  smtp_port?: number;
  smtp_username?: string;
  smtp_password?: string;
  use_tls?: boolean;
  use_ssl?: boolean;
  timeout?: number;
  sender_name?: string;
  from_email?: string;
  reply_to?: string;
};
