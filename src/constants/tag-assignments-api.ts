/** Django DRF v1 tag assignment endpoints (relative to HMIS_API_URL, server-only). */
export const TAG_ASSIGNMENTS_API_PATHS = {
  list: "/tag-assignments/",
  detail: (uuid: string) => `/tag-assignments/${uuid}/`,
} as const;
