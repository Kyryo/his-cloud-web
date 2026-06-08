/** Django DRF v1 user management endpoints (relative to HMIS_API_URL, server-only). */
export const USERS_API_PATHS = {
  list: "/user-management/",
  detail: (id: number) => `/user-management/${id}/`,
} as const;
