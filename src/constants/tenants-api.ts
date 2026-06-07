/** Django DRF v1 tenant endpoints (relative to HMIS_API_URL, server-only). */
export const TENANTS_API_PATHS = {
  detail: (uuid: string) => `/tenants/${uuid}/`,
} as const;
