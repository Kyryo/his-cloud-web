/** Server-only Django DRF base URL. Never expose to the browser. */
export const HMIS_API_URL = process.env.HMIS_API_URL;

/** Browser-facing BFF auth routes (same origin). */
export const BFF_AUTH_ROUTES = {
  session: "/api/auth/session",
  signinRequestOtp: "/api/auth/signin/request-otp",
  signinVerify: "/api/auth/signin/verify",
  signupRequestOtp: "/api/auth/signup/request-otp",
  signupVerifyEmail: "/api/auth/signup/verify-email",
  signupVerify: "/api/auth/signup/verify",
  refresh: "/api/auth/refresh",
  logout: "/api/auth/logout",
  me: "/api/auth/me",
} as const;

/** Browser-facing BFF customer routes (same origin). */
export const BFF_CUSTOMERS_ROUTES = {
  list: "/api/customers",
  detail: (uuid: string) => `/api/customers/${uuid}`,
  insurance: (uuid: string) => `/api/customers/${uuid}/insurance`,
  insuranceDetail: (customerUuid: string, insuranceUuid: string) =>
    `/api/customers/${customerUuid}/insurance/${insuranceUuid}`,
  billing: (uuid: string) => `/api/customers/${uuid}/billing`,
  visits: (uuid: string, query?: { limit?: number }) => {
    const params = new URLSearchParams();
    if (query?.limit) {
      params.set("limit", String(query.limit));
    }
    const suffix = params.toString();
    return suffix
      ? `/api/customers/${uuid}/visits?${suffix}`
      : `/api/customers/${uuid}/visits`;
  },
} as const;

/** Browser-facing BFF visit routes (same origin). */
export const BFF_VISITS_ROUTES = {
  list: "/api/visits",
  create: "/api/visits",
  detail: (uuid: string) => `/api/visits/${uuid}`,
  end: (uuid: string) => `/api/visits/${uuid}/end`,
  fromAppointment: (appointmentUuid: string) =>
    `/api/visits/from-appointment/${appointmentUuid}`,
  encounters: (uuid: string) => `/api/visits/${uuid}/encounters`,
  encounterStart: (visitUuid: string, encounterUuid: string) =>
    `/api/visits/${visitUuid}/encounters/${encounterUuid}/start`,
  encounterComplete: (visitUuid: string, encounterUuid: string) =>
    `/api/visits/${visitUuid}/encounters/${encounterUuid}/complete`,
  encounterCancel: (visitUuid: string, encounterUuid: string) =>
    `/api/visits/${visitUuid}/encounters/${encounterUuid}/cancel`,
  consultationServicesCatalog: "/api/consultation-services/catalog",
} as const;

/** Browser-facing BFF appointment routes (same origin). */
export const BFF_APPOINTMENTS_ROUTES = {
  list: "/api/appointments",
  detail: (uuid: string) => `/api/appointments/${uuid}`,
  confirm: (uuid: string) => `/api/appointments/${uuid}/confirm`,
  cancel: (uuid: string) => `/api/appointments/${uuid}/cancel`,
  noShow: (uuid: string) => `/api/appointments/${uuid}/no-show`,
  start: (uuid: string) => `/api/appointments/${uuid}/start`,
  careProviders: "/api/appointments/care-providers",
  clinicianMe: "/api/appointments/clinician/me",
} as const;

/** Browser-facing BFF clinical catalog routes (same origin). */
export const BFF_CLINICAL_ROUTES = {
  clinics: "/api/clinical/clinics",
  departments: "/api/clinical/departments",
  locations: "/api/clinical/locations",
} as const;

/** Browser-facing BFF insurance catalog routes (same origin). */
export const BFF_INSURANCE_ROUTES = {
  schemes: "/api/insurance-schemes",
} as const;

/** Browser-facing BFF customer address routes (same origin). */
export const BFF_CUSTOMER_ADDRESSES_ROUTES = {
  list: "/api/customer-addresses",
  detail: (uuid: string) => `/api/customer-addresses/${uuid}`,
} as const;

/** Browser-facing BFF customer note routes (same origin). */
export const BFF_CUSTOMER_NOTES_ROUTES = {
  list: "/api/customer-notes",
  detail: (uuid: string) => `/api/customer-notes/${uuid}`,
} as const;

/** Browser-facing BFF customer encounter routes (same origin). */
export const BFF_CUSTOMER_ENCOUNTERS_ROUTES = {
  list: "/api/customer-encounters",
} as const;

/** Browser-facing BFF sales order routes (same origin). */
export const BFF_SALES_ORDERS_ROUTES = {
  list: "/api/sales-orders",
  detail: (orderId: number | string) => `/api/sales-orders/${orderId}`,
  lines: (orderId: number | string) => `/api/sales-orders/${orderId}/lines`,
  linePrice: (orderId: number | string, lineId: number | string) =>
    `/api/sales-order-line-prices/${orderId}/${lineId}`,
  lineDetail: (orderId: number | string, lineId: number | string) =>
    `/api/sales-order-lines/${orderId}/${lineId}`,
  invoice: (orderId: number | string) => `/api/sales-orders/${orderId}/invoice`,
  cancel: (orderId: number | string) => `/api/sales-orders/${orderId}/cancel`,
  activity: (orderId: number | string) => `/api/sales-orders/${orderId}/activity`,
} as const;

/** Browser-facing BFF sales order activity routes (same origin). */
export const BFF_SALES_ORDER_ACTIVITY_ROUTES = {
  detail: (orderId: number | string) => `/api/sales-orders/${orderId}/activity`,
} as const;

/** Browser-facing BFF invoice routes (same origin). */
export const BFF_INVOICES_ROUTES = {
  list: "/api/invoices",
  detail: (invoiceId: number | string) => `/api/invoices/${invoiceId}`,
  activity: (invoiceId: number | string) => `/api/invoices/${invoiceId}/activity`,
} as const;

/** Browser-facing BFF invoice activity routes (same origin). */
export const BFF_INVOICE_ACTIVITY_ROUTES = {
  detail: (invoiceId: number | string) => `/api/invoices/${invoiceId}/activity`,
} as const;

/** Browser-facing BFF e-claims routes (same origin). */
export const BFF_CLAIMS_ROUTES = {
  list: "/api/claims",
  detail: (claimId: number | string) => `/api/claims/${claimId}`,
  fromInvoice: (invoiceId: number | string) =>
    `/api/claims/from-invoice/${invoiceId}`,
  byInvoice: (invoiceId: number | string) => `/api/claims/by-invoice/${invoiceId}`,
  verifyMember: "/api/claims/verify-member",
  submit: (claimId: number | string) => `/api/claims/${claimId}/submit`,
  masmIntegration: "/api/integrations/eclaims/masm",
  practitionerMappings: "/api/integrations/eclaims/practitioner-mappings",
  practitionerMappingsUpsert:
    "/api/integrations/eclaims/practitioner-mappings/upsert",
} as const;

/** Browser-facing BFF clinical diagnosis routes (same origin). */
export const BFF_CLINICAL_DIAGNOSIS_ROUTES = {
  encounterDiagnoses: (visitUuid: string, encounterUuid: string) =>
    `/api/clinical/visits/${visitUuid}/encounters/${encounterUuid}/diagnoses`,
  diagnosisDetail: (diagnosisUuid: string) =>
    `/api/clinical/diagnoses/${diagnosisUuid}`,
  diagnosisCatalogSearch: "/api/clinical/diagnosis-catalog/search",
} as const;

/** Browser-facing BFF payment routes (same origin). */
export const BFF_PAYMENTS_ROUTES = {
  list: "/api/payments",
  detail: (paymentId: number | string) => `/api/payments/${paymentId}`,
} as const;

/** Browser-facing BFF inventory routes (same origin). */
export const BFF_INVENTORY_ROUTES = {
  stock: {
    list: "/api/inventory/stock",
    detail: (uuid: string) => `/api/inventory/stock/${uuid}`,
  },
  movements: {
    list: "/api/inventory/movements",
    detail: (uuid: string) => `/api/inventory/movements/${uuid}`,
  },
  products: {
    list: "/api/inventory/products",
    detail: (productUuid: string) => `/api/inventory/products/${productUuid}`,
    pricelists: (productUuid: string) =>
      `/api/inventory/product-pricelists/${productUuid}`,
    tariffCodes: (productUuid: string) =>
      `/api/inventory/product-tariff-codes/${productUuid}`,
    tariffCodeDetail: (productUuid: string, schemeUuid: string) =>
      `/api/inventory/product-tariff-codes/${productUuid}/${schemeUuid}`,
    stockLocations: (productUuid: string) =>
      `/api/inventory/product-stock-locations/${productUuid}`,
    imports: "/api/inventory/products/imports",
    importDetail: (importUuid: string) => `/api/inventory/products/imports/${importUuid}`,
    importTemplate: "/api/inventory/products/import-template",
  },
  pricelists: {
    list: "/api/inventory/pricelists",
    detail: (pricelistUuid: string) => `/api/inventory/pricelists/${pricelistUuid}`,
    products: (pricelistUuid: string) =>
      `/api/inventory/pricelists/${pricelistUuid}/products`,
    productDetail: (pricelistUuid: string, productUuid: string) =>
      `/api/inventory/pricelists/${pricelistUuid}/products/${productUuid}`,
    approvalConfiguration: "/api/inventory/pricelists/approval-configuration",
    priceChanges: "/api/inventory/pricelists/price-changes",
    priceChangeDetail: (changeUuid: string) =>
      `/api/inventory/pricelists/price-changes/${changeUuid}`,
    confirmPriceChange: (changeUuid: string) =>
      `/api/inventory/pricelists/price-changes/${changeUuid}/confirm`,
    rejectPriceChange: (changeUuid: string) =>
      `/api/inventory/pricelists/price-changes/${changeUuid}/reject`,
    rules: (pricelistUuid: string) =>
      `/api/inventory/pricelists/${pricelistUuid}/rules`,
    ruleDetail: (pricelistUuid: string, ruleUuid: string) =>
      `/api/inventory/pricelists/${pricelistUuid}/rules/${ruleUuid}`,
    default: "/api/pricelists/default",
  },
  batches: {
    list: "/api/inventory/batches",
    detail: (uuid: string) => `/api/inventory/batches/${uuid}`,
    suppliersSearch: "/api/inventory/batches/suppliers",
  },
  purchaseOrders: {
    list: "/api/inventory/purchase-orders",
    detail: (uuid: string) => `/api/inventory/purchase-orders/${uuid}`,
    action: (uuid: string, action: string) =>
      `/api/inventory/purchase-orders/${uuid}/${action}`,
  },
  internalOrders: {
    list: "/api/inventory/internal-orders",
    detail: (uuid: string) => `/api/inventory/internal-orders/${uuid}`,
    action: (uuid: string, action: string) =>
      `/api/inventory/internal-orders/${uuid}/${action}`,
  },
  stockAdjustments: {
    list: "/api/inventory/stock-adjustments",
    detail: (uuid: string) => `/api/inventory/stock-adjustments/${uuid}`,
    action: (uuid: string, action: string) =>
      `/api/inventory/stock-adjustments/${uuid}/${action}`,
  },
  clinicConfigurations: {
    list: "/api/inventory/clinic-configurations",
    detail: (uuid: string) => `/api/inventory/clinic-configurations/${uuid}`,
  },
  workflows: {
    list: "/api/inventory/workflows",
    detail: (uuid: string) => `/api/inventory/workflows/${uuid}`,
  },
  workflowSteps: {
    list: "/api/inventory/workflow-steps",
    detail: (uuid: string) => `/api/inventory/workflow-steps/${uuid}`,
  },
  approvalRecords: {
    list: "/api/inventory/approval-records",
    detail: (uuid: string) => `/api/inventory/approval-records/${uuid}`,
  },
  locations: "/api/inventory/locations",
} as const;

/** Browser-facing BFF onboarding routes (same origin). */
export const BFF_ONBOARDING_ROUTES = {
  modules: "/api/onboarding/modules",
} as const;

/** Browser-facing BFF settings routes (same origin). */
export const BFF_SETTINGS_ROUTES = {
  updateProfile: "/api/auth/me",
  organization: "/api/tenants/current",
  clinics: "/api/clinics",
  clinicDetail: (uuid: string) => `/api/clinics/${uuid}`,
  locations: "/api/locations",
  locationDetail: (uuid: string) => `/api/locations/${uuid}`,
  departments: "/api/departments",
  departmentDetail: (uuid: string) => `/api/departments/${uuid}`,
  visitTypes: "/api/consultation-services",
  visitTypeDetail: (uuid: string) => `/api/consultation-services/${uuid}`,
  consultationServices: "/api/consultation-services",
  consultationServiceDetail: (uuid: string) => `/api/consultation-services/${uuid}`,
  insuranceCompanies: "/api/insurance-companies",
  insuranceSchemes: "/api/insurance-schemes",
  pricelists: "/api/pricelists",
  pricelistDetail: (id: number | string) => `/api/pricelists/${id}`,
  pricelistAddProduct: (id: number | string) => `/api/pricelists/${id}/products`,
  pricelistUpdateProductPrice: (id: number | string, itemId: number | string) =>
    `/api/pricelists/${id}/products/${itemId}/price`,
  pricelistRemoveProduct: (id: number | string, itemId: number | string) =>
    `/api/pricelists/${id}/products/${itemId}`,
  pricelistDefault: "/api/pricelists/default",
  branding: "/api/tenants/current/branding",
  currency: "/api/tenants/current/currency",
  users: "/api/user-management",
  userDetail: (id: number) => `/api/user-management/${id}`,
  groups: "/api/groups",
  groupDetail: (id: number) => `/api/groups/${id}`,
  groupAddUser: "/api/groups/add-user",
  groupRemoveUser: "/api/groups/remove-user",
  userClinics: "/api/user-clinics",
  userClinicDetail: (id: number) => `/api/user-clinics/${id}`,
  userClinicSetPrimary: (id: number) => `/api/user-clinics/${id}/set-primary`,
  userLocations: "/api/user-locations",
  userLocationDetail: (id: number) => `/api/user-locations/${id}`,
  userLocationSetPrimary: (id: number) => `/api/user-locations/${id}/set-primary`,
  emailConfiguration: "/api/integrations/email-configuration",
  emailConfigurationDetail: (id: number | string) =>
    `/api/integrations/email-configuration/${id}`,
  masmIntegration: "/api/integrations/eclaims/masm",
  eclaimsPractitionerMappings: "/api/integrations/eclaims/practitioner-mappings",
  eclaimsPractitionerMappingsUpsert:
    "/api/integrations/eclaims/practitioner-mappings/upsert",
} as const;

/** Browser-facing BFF platform administration routes (same origin). */
export const BFF_PLATFORM_ADMIN_ROUTES = {
  dashboard: "/api/platform-admin/dashboard",
  tenants: "/api/platform-admin/tenants",
  tenantDetail: (tenantUuid: string) => `/api/platform-admin/tenants/${tenantUuid}`,
  tenantStatus: (tenantUuid: string) =>
    `/api/platform-admin/tenants/${tenantUuid}/status`,
  tenantClinics: (tenantUuid: string) =>
    `/api/platform-admin/tenants/${tenantUuid}/clinics`,
  tenantLocations: (tenantUuid: string) =>
    `/api/platform-admin/tenants/${tenantUuid}/locations`,
  tenantDepartments: (tenantUuid: string) =>
    `/api/platform-admin/tenants/${tenantUuid}/departments`,
  tenantUsers: (tenantUuid: string) =>
    `/api/platform-admin/tenants/${tenantUuid}/users`,
  tenantConfiguration: (tenantUuid: string) =>
    `/api/platform-admin/tenants/${tenantUuid}/configuration`,
  tenantAuditEvents: (tenantUuid: string) =>
    `/api/platform-admin/tenants/${tenantUuid}/audit-events`,
} as const;
