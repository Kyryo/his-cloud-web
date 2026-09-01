/** Django DRF v1 customer legal guardian endpoints (relative to HMIS_API_URL, server-only). */
export const CUSTOMER_LEGAL_GUARDIANS_API_PATHS = {
  list: "/customer-legal-guardians/",
  detail: (uuid: string) => `/customer-legal-guardians/${uuid}/`,
} as const;
