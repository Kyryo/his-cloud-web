/** Django DRF v1 group endpoints (relative to HMIS_API_URL, server-only). */
export const GROUPS_API_PATHS = {
  list: "/groups/",
  detail: (id: number) => `/groups/${id}/`,
  addUser: "/groups/add-user/",
  removeUser: "/groups/remove-user/",
} as const;
