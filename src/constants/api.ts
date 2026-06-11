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
  create: "/api/visits",
  detail: (uuid: string) => `/api/visits/${uuid}`,
  end: (uuid: string) => `/api/visits/${uuid}/end`,
  visitTypesCatalog: "/api/visit-types/catalog",
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
      `/api/inventory/products/${productId}/pricelists`,
    stockLocations: (productId: number | string) =>
      `/api/inventory/products/${productId}/stock-locations`,
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
  visitTypes: "/api/visit-types",
  visitTypeDetail: (uuid: string) => `/api/visit-types/${uuid}`,
  insuranceCompanies: "/api/insurance-companies",
  insuranceSchemes: "/api/insurance-schemes",
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
} as const;
