/** Django DRF v1 tenant endpoints (relative to HMIS_API_URL, server-only). */
export const TENANTS_API_PATHS = {
  detail: (uuid: string) => `/tenants/${uuid}/`,
  branding: (uuid: string) => `/tenants/${uuid}/branding/`,
  currency: (uuid: string) => `/tenants/${uuid}/currency/`,
} as const;
