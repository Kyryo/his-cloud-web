/** Django DRF v1 platform-admin endpoints (relative to HMIS_API_URL). */
export const PLATFORM_ADMIN_API_PATHS = {
  dashboard: "/platform-admin/dashboard/",
  overview: "/platform-admin/overview/",
  financeTenantPayments: "/platform-admin/finance/tenant-payments/",
  financeOperatingCosts: "/platform-admin/finance/operating-costs/",
  financeCashSnapshots: "/platform-admin/finance/cash-snapshots/",
  tenants: "/platform-admin/tenants/",
  tenantDetail: (tenantUuid: string) => `/platform-admin/tenants/${tenantUuid}/`,
  tenantStatus: (tenantUuid: string) =>
    `/platform-admin/tenants/${tenantUuid}/status/`,
  tenantClinics: (tenantUuid: string) =>
    `/platform-admin/tenants/${tenantUuid}/clinics/`,
  tenantLocations: (tenantUuid: string) =>
    `/platform-admin/tenants/${tenantUuid}/locations/`,
  tenantDepartments: (tenantUuid: string) =>
    `/platform-admin/tenants/${tenantUuid}/departments/`,
  tenantUsers: (tenantUuid: string) =>
    `/platform-admin/tenants/${tenantUuid}/users/`,
  tenantConfiguration: (tenantUuid: string) =>
    `/platform-admin/tenants/${tenantUuid}/configuration/`,
  tenantAuditEvents: (tenantUuid: string) =>
    `/platform-admin/tenants/${tenantUuid}/audit-events/`,
  tenantUsage: (tenantUuid: string) =>
    `/platform-admin/tenants/${tenantUuid}/usage/`,
} as const;
