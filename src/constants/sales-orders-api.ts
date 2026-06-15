/** Django DRF v1 sales-order endpoints (relative to HMIS_API_URL, server-only). */
export const SALES_ORDERS_API_PATHS = {
  list: "/sales-orders/",
  detail: (orderId: number | string) => `/sales-orders/${orderId}/`,
  lines: (orderId: number | string) => `/sales-orders/${orderId}/lines/`,
  linePrice: (orderId: number | string, lineId: number | string) =>
    `/sales-orders/${orderId}/lines/${lineId}/price/`,
  lineDetail: (orderId: number | string, lineId: number | string) =>
    `/sales-orders/${orderId}/lines/${lineId}/`,
  invoice: (orderId: number | string) => `/sales-orders/${orderId}/invoice/`,
} as const;
