/** Django DRF v1 consultation service endpoints (relative to HMIS_API_URL). */
export const VISIT_TYPES_API_PATHS = {
  list: "/consultation-services/",
  detail: (uuid: string) => `/consultation-services/${uuid}/`,
} as const;
