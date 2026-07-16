/** Django DRF v1 payment endpoints (relative to HMIS_API_URL, server-only). */
export const PAYMENTS_API_PATHS = {
  list: "/payments/",
  detail: (paymentId: number | string) => `/payments/${paymentId}/`,
  cancel: (paymentId: number | string) => `/payments/${paymentId}/cancel/`,
  sendReceipt: (paymentId: number | string) => `/payments/${paymentId}/send-receipt/`,
} as const;
