/** Django DRF v1 inventory endpoints (relative to HMIS_API_URL, server-only). */
import { CATALOG_API_PATHS } from "@/constants/catalog-api";

export const INVENTORY_API_PATHS = {
  stock: {
    list: "/inventory/stock/",
    detail: (uuid: string) => `/inventory/stock/${uuid}/`,
  },
  movements: {
    list: "/inventory/movements/",
    detail: (uuid: string) => `/inventory/movements/${uuid}/`,
  },
  products: CATALOG_API_PATHS.products,
  batches: {
    list: "/inventory/batches/",
    detail: (uuid: string) => `/inventory/batches/${uuid}/`,
    suppliersSearch: "/inventory/batches/suppliers/search/",
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
    availableProducts: (uuid: string) =>
      `/inventory/internal-orders/${uuid}/available-products/`,
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
  tenantConfiguration: "/inventory/tenant-configuration/",
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
  dispensations: {
    queue: {
      list: "/inventory/dispensations/queue/",
      detail: (salesOrderUuid: string) =>
        `/inventory/dispensations/queue/${salesOrderUuid}/`,
    },
    list: "/inventory/dispensations/",
    detail: (uuid: string) => `/inventory/dispensations/${uuid}/`,
    batch: "/inventory/dispensations/batch/",
  },
  dispensationConfigurations: {
    list: "/inventory/dispensation-configurations/",
    detail: (uuid: string) => `/inventory/dispensation-configurations/${uuid}/`,
    forClinic: (clinicId: number) =>
      `/inventory/dispensation-configurations/for-clinic/${clinicId}/`,
  },
} as const;
