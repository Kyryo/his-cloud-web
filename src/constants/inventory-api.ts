/** Django DRF v1 inventory endpoints (relative to HMIS_API_URL, server-only). */
export const INVENTORY_API_PATHS = {
  stock: {
    list: "/inventory/stock/",
    detail: (uuid: string) => `/inventory/stock/${uuid}/`,
  },
  movements: {
    list: "/inventory/movements/",
    detail: (uuid: string) => `/inventory/movements/${uuid}/`,
  },
  products: {
    list: "/inventory/products/",
    detail: (productId: number | string) => `/inventory/products/${productId}/`,
    search: "/inventory/products/search/",
    pricelists: (productId: number | string) =>
      `/inventory/products/${productId}/pricelists/`,
    stockLocations: (productId: number | string) =>
      `/inventory/products/${productId}/stock-locations/`,
  },
  batches: {
    list: "/inventory/batches/",
    detail: (uuid: string) => `/inventory/batches/${uuid}/`,
  },
  purchaseOrders: {
    list: "/inventory/purchase-orders/",
    detail: (uuid: string) => `/inventory/purchase-orders/${uuid}/`,
    action: (uuid: string, action: string) =>
      `/inventory/purchase-orders/${uuid}/${action}/`,
  },
  internalOrders: {
    list: "/inventory/internal-orders/",
    detail: (uuid: string) => `/inventory/internal-orders/${uuid}/`,
    action: (uuid: string, action: string) =>
      `/inventory/internal-orders/${uuid}/${action}/`,
  },
  stockAdjustments: {
    list: "/inventory/stock-adjustments/",
    detail: (uuid: string) => `/inventory/stock-adjustments/${uuid}/`,
    action: (uuid: string, action: string) =>
      `/inventory/stock-adjustments/${uuid}/${action}/`,
  },
  clinicConfigurations: {
    list: "/inventory/clinic-configurations/",
    detail: (uuid: string) => `/inventory/clinic-configurations/${uuid}/`,
  },
  workflows: {
    list: "/inventory/workflows/",
    detail: (uuid: string) => `/inventory/workflows/${uuid}/`,
  },
  workflowSteps: {
    list: "/inventory/workflow-steps/",
    detail: (uuid: string) => `/inventory/workflow-steps/${uuid}/`,
  },
  approvalRecords: {
    list: "/inventory/approval-records/",
    detail: (uuid: string) => `/inventory/approval-records/${uuid}/`,
  },
} as const;
