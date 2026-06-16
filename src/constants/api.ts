/** Server-only Django DRF base URL. Never expose to the browser. */
export const HMIS_API_URL = process.env.HMIS_API_URL;

/** Browser-facing BFF auth routes (same origin). */
export const BFF_AUTH_ROUTES = {
  session: "/api/auth/session",
  signinRequestOtp: "/api/auth/signin/request-otp",
  signinVerify: "/api/auth/signin/verify",
  signupRequestOtp: "/api/auth/signup/request-otp",
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
} as const;

/** Browser-facing BFF invoice routes (same origin). */
export const BFF_INVOICES_ROUTES = {
  list: "/api/invoices",
  detail: (invoiceId: number | string) => `/api/invoices/${invoiceId}`,
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
    search: "/api/inventory/products/search",
    detail: (productId: number | string) => `/api/inventory/products/${productId}`,
    pricelists: (productId: number | string) =>
      `/api/inventory/product-pricelists/${productId}`,
    tariffCodes: (productId: number | string) =>
      `/api/inventory/product-tariff-codes/${productId}`,
    tariffCodeDetail: (productId: number | string, schemeUuid: string) =>
      `/api/inventory/product-tariff-codes/${productId}/${schemeUuid}`,
    stockLocations: (productId: number | string) =>
      `/api/inventory/product-stock-locations/${productId}`,
  },
  batches: {
    list: "/api/inventory/batches",
    detail: (uuid: string) => `/api/inventory/batches/${uuid}`,
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
} as const;
