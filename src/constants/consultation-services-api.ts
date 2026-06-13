/** Django DRF v1 consultation service endpoints (relative to HMIS_API_URL, server-only). */
export const CONSULTATION_SERVICES_API_PATHS = {
  list: "/consultation-services/",
  detail: (uuid: string) => `/consultation-services/${uuid}/`,
} as const;
