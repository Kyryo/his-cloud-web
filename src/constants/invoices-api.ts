/** Django DRF v1 invoice endpoints (relative to HMIS_API_URL, server-only). */
export const INVOICES_API_PATHS = {
  list: "/invoices/",
  detail: (invoiceId: number | string) => `/invoices/${invoiceId}/`,
} as const;
