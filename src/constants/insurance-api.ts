/** Django DRF v1 insurance endpoints (relative to HMIS_API_URL, server-only). */
export const INSURANCE_API_PATHS = {
  companies: "/insurance-companies/",
  schemes: "/insurance-schemes/",
  schemeDetail: (uuid: string) => `/insurance-schemes/${uuid}/`,
} as const;
