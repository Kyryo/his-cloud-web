/** Django DRF v1 tag endpoints (relative to HMIS_API_URL, server-only). */
export const TAGS_API_PATHS = {
  list: "/tags/",
  detail: (uuid: string) => `/tags/${uuid}/`,
} as const;
