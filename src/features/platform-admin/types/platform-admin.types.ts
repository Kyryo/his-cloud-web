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

export type PlatformAdminTenantUsageLevel = "High" | "Moderate" | "Low" | "None";

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
  usage_level: PlatformAdminTenantUsageLevel;
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

export type PlatformAdminUsagePeriod = "day" | "week" | "month";

export type PlatformAdminUsageFilters = {
  dateFrom: string;
  dateTo: string;
  period?: PlatformAdminUsagePeriod;
};

export type PlatformAdminUsageSeriesPoint = {
  label: string;
  count: number;
};

export type PlatformAdminUsageHourPoint = {
  hour: number;
  label: string;
  count: number;
};

export type PlatformAdminUsageSummary = {
  sign_ins: number;
  unique_sign_in_users: number;
  users_logged_in: number;
  active_users: number;
  visits: number;
  appointments: number;
  sales_orders: number;
  invoices: number;
  payments: number;
  claims: number;
};

export type PlatformAdminUsageSeries = {
  sign_ins: PlatformAdminUsageSeriesPoint[];
  visits: PlatformAdminUsageSeriesPoint[];
  appointments: PlatformAdminUsageSeriesPoint[];
  sales_orders: PlatformAdminUsageSeriesPoint[];
  invoices: PlatformAdminUsageSeriesPoint[];
  payments: PlatformAdminUsageSeriesPoint[];
  claims: PlatformAdminUsageSeriesPoint[];
};

export type PlatformAdminUsageResponse = {
  date_from: string;
  date_to: string;
  period: PlatformAdminUsagePeriod;
  summary: PlatformAdminUsageSummary;
  series: PlatformAdminUsageSeries;
  activity_by_hour: PlatformAdminUsageHourPoint[];
  engagement: PlatformAdminUsageEngagement;
  feature_adoption: PlatformAdminUsageFeatureAdoption;
  time_to_first_value: PlatformAdminUsageTimeToFirstValue;
  inactive_alerts: PlatformAdminUsageInactiveAlerts;
  cohort_retention: PlatformAdminUsageCohortRetention;
};

export type PlatformAdminUsageEngagement = {
  dau: number;
  wau: number;
  mau: number;
};

export type PlatformAdminUsageFeatureAdoption = {
  customers_registered: number;
  products_catalogued: number;
  appointments_scheduled: number;
  inventory_movements: number;
  clinical_notes: number;
  therapy_sessions: number;
  claims_submitted: number;
  reports_exported: number;
};

export type PlatformAdminUsageTimeToFirstValue = {
  visits_target: number;
  invoices_target: number;
  days_to_visits_target: number | null;
  days_to_invoices_target: number | null;
  visits_reached_at: string | null;
  invoices_reached_at: string | null;
  onboarding_date: string;
};

export type PlatformAdminUsageInactiveAlerts = {
  days_since_last_sales_order: number | null;
  days_since_last_invoice: number | null;
  days_since_last_billing_activity: number | null;
  inactive_14_days: boolean;
  inactive_30_days: boolean;
  status: "active" | "warning" | "inactive";
  message: string;
};

export type PlatformAdminUsageCohortMilestone = {
  day: number;
  evaluable: boolean;
  active: boolean;
  sales_orders: number;
  invoices: number;
};

export type PlatformAdminUsageCohortRetention = {
  onboarding_date: string;
  days_since_onboarding: number;
  milestones: PlatformAdminUsageCohortMilestone[];
};

export type PlatformAdminMoneyMetric = {
  amount: string;
  currency_code: string;
};

export type PlatformAdminOverviewRevenue = PlatformAdminMoneyMetric & {
  period_label: string;
};

export type PlatformAdminOverviewBurnRate = PlatformAdminMoneyMetric & {
  window_months: number;
};

export type PlatformAdminOverviewSummary = {
  active_tenants: number;
  revenue: PlatformAdminOverviewRevenue;
  burn_rate: PlatformAdminOverviewBurnRate;
  runway_months: number | null;
};

export type PlatformAdminCohortMonthPoint = {
  offset: number;
  active_count: number;
  retention_rate: number;
};

export type PlatformAdminCohort = {
  cohort_month: string;
  tenant_count: number;
  months: PlatformAdminCohortMonthPoint[];
};

export type PlatformAdminCohortRetention = {
  activity_definition: string;
  cohorts: PlatformAdminCohort[];
};

export type PlatformAdminNdrPoint = {
  month: string;
  ndr_percent: number;
};

export type PlatformAdminNetDollarRetention = {
  current_month_ndr_percent: number | null;
  series: PlatformAdminNdrPoint[];
};

export type PlatformAdminOverview = {
  summary: PlatformAdminOverviewSummary;
  cohort_retention: PlatformAdminCohortRetention;
  net_dollar_retention: PlatformAdminNetDollarRetention;
};

export type PlatformAdminTenantPayment = {
  id: number;
  uuid: string;
  tenant: number;
  tenant_name: string;
  tenant_uuid: string;
  amount: string;
  currency_code: string;
  payment_date: string;
  period_start: string | null;
  period_end: string | null;
  notes: string;
  created_at: string;
};

export type PlatformAdminTenantPaymentPayload = {
  tenant: number;
  amount: string;
  currency_code?: string;
  payment_date: string;
  period_start?: string | null;
  period_end?: string | null;
  notes?: string;
};

export type PlatformAdminOperatingCostCategory =
  | "infrastructure"
  | "payroll"
  | "software"
  | "support"
  | "other";

export type PlatformAdminOperatingCost = {
  id: number;
  uuid: string;
  category: PlatformAdminOperatingCostCategory;
  amount: string;
  currency_code: string;
  cost_date: string;
  description: string;
  created_at: string;
};

export type PlatformAdminOperatingCostPayload = {
  category: PlatformAdminOperatingCostCategory;
  amount: string;
  currency_code?: string;
  cost_date: string;
  description?: string;
};

export type PlatformAdminCashSnapshot = {
  id: number;
  uuid: string;
  balance_date: string;
  amount: string;
  currency_code: string;
  created_at: string;
};

export type PlatformAdminCashSnapshotPayload = {
  balance_date: string;
  amount: string;
  currency_code?: string;
};
