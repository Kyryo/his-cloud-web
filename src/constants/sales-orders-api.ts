/** Django DRF v1 Odoo sales-order endpoints (relative to HMIS_API_URL, server-only). */
export const SALES_ORDERS_API_PATHS = {
  list: "/sales-orders/",
  detail: (orderId: number | string) => `/sales-orders/${orderId}/`,
} as const;
