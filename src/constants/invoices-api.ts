/** Django DRF v1 invoice endpoints (relative to HMIS_API_URL, server-only). */
export const INVOICES_API_PATHS = {
  list: "/invoices/",
  detail: (invoiceId: number | string) => `/invoices/${invoiceId}/`,
  cancel: (invoiceId: number | string) => `/invoices/${invoiceId}/cancel/`,
  internalReference: (invoiceId: number | string) =>
    `/invoices/${invoiceId}/internal-reference/`,
  activity: (invoiceId: number | string) => `/invoices/${invoiceId}/activity/`,
} as const;
