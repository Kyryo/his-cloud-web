/** Django DRF v1 customer endpoints (relative to HMIS_API_URL, server-only). */
export const CUSTOMERS_API_PATHS = {
  list: "/customers/",
  detail: (uuid: string) => `/customers/${uuid}/`,
  insurance: (uuid: string) => `/customers/${uuid}/insurance/`,
  insuranceDetail: (customerUuid: string, insuranceUuid: string) =>
    `/customers/${customerUuid}/insurance/${insuranceUuid}/`,
  billing: (uuid: string) => `/customers/${uuid}/billing/`,
  visits: (uuid: string) =>
    `/visits/customer-visits/?customer_uuid=${encodeURIComponent(uuid)}`,
} as const;
