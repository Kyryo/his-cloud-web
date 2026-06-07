/** Django DRF v1 customer address endpoints (relative to HMIS_API_URL, server-only). */
export const CUSTOMER_ADDRESSES_API_PATHS = {
  list: "/customer-addresses/",
  detail: (uuid: string) => `/customer-addresses/${uuid}/`,
} as const;
