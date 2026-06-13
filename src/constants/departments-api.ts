/** Django DRF v1 department endpoints (relative to HMIS_API_URL, server-only). */
export const DEPARTMENTS_API_PATHS = {
  list: "/departments/",
  detail: (uuid: string) => `/departments/${uuid}/`,
} as const;
