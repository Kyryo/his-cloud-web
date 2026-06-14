/** Django DRF v1 Odoo sales-order endpoints (relative to HMIS_API_URL, server-only). */
export const SALES_ORDERS_API_PATHS = {
  list: "/sales-orders/",
  detail: (orderId: number | string) => `/sales-orders/${orderId}/`,
  lines: (orderId: number | string) => `/sales-orders/${orderId}/lines/`,
  linePrice: (orderId: number | string, lineId: number | string) =>
    `/sales-orders/${orderId}/lines/${lineId}/price/`,
  lineDetail: (orderId: number | string, lineId: number | string) =>
    `/sales-orders/${orderId}/lines/${lineId}/`,
} as const;
