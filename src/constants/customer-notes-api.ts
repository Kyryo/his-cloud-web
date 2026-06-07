/** Django DRF v1 customer note endpoints (relative to HMIS_API_URL, server-only). */
export const CUSTOMER_NOTES_API_PATHS = {
  list: "/customer-notes/",
  detail: (uuid: string) => `/customer-notes/${uuid}/`,
} as const;
