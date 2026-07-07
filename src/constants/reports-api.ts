/** Django DRF v1 report job endpoints (relative to HMIS_API_URL, server-only). */
export const REPORTS_API_PATHS = {
  list: "/reports/",
  types: "/reports/types/",
  detail: (uuid: string) => `/reports/${uuid}/`,
  download: (uuid: string) => `/reports/${uuid}/download/`,
  cancel: (uuid: string) => `/reports/${uuid}/cancel/`,
} as const;
