/** Django DRF v1 location endpoints (relative to HMIS_API_URL, server-only). */
export const LOCATIONS_API_PATHS = {
  list: "/locations/",
  detail: (uuid: string) => `/locations/${uuid}/`,
} as const;
