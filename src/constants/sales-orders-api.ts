/** Django DRF v1 sales-order endpoints (relative to HMIS_API_URL, server-only). */
export const SALES_ORDERS_API_PATHS = {
  list: "/sales-orders/",
  summaryStats: "/sales-orders/summary-stats/",
  detail: (orderId: number | string) => `/sales-orders/${orderId}/`,
  lines: (orderId: number | string) => `/sales-orders/${orderId}/lines/`,
  linePrice: (orderId: number | string, lineId: number | string) =>
    `/sales-orders/${orderId}/lines/${lineId}/price/`,
  lineDetail: (orderId: number | string, lineId: number | string) =>
    `/sales-orders/${orderId}/lines/${lineId}/`,
  lineDental: (orderId: number | string, lineId: number | string) =>
    `/sales-orders/${orderId}/lines/${lineId}/dental/`,
  lineReprice: (orderId: number | string, lineId: number | string) =>
    `/sales-orders/${orderId}/lines/${lineId}/reprice/`,
  split: (orderId: number | string) => `/sales-orders/${orderId}/split/`,
  mergeLines: (orderId: number | string) => `/sales-orders/${orderId}/lines/merge/`,
  linePayability: (orderId: number | string, lineId: number | string) =>
    `/sales-orders/${orderId}/lines/${lineId}/payability/`,
  invoice: (orderId: number | string) => `/sales-orders/${orderId}/invoice/`,
  cancel: (orderId: number | string) => `/sales-orders/${orderId}/cancel/`,
  reprice: (orderId: number | string) => `/sales-orders/${orderId}/reprice/`,
  paymentSplit: (orderId: number | string) =>
    `/sales-orders/${orderId}/payment-split/`,
  attachments: (orderId: number | string) =>
    `/sales-orders/${orderId}/attachments/`,
} as const;
