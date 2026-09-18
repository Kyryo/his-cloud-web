/** Django DRF v1 laboratory endpoints (relative to HMIS_API_URL, server-only). */
export const LABORATORY_API_PATHS = {
  orders: "/laboratory/orders/",
  order: (uuid: string) => `/laboratory/orders/${uuid}/`,
  cancel: (uuid: string) => `/laboratory/orders/${uuid}/cancel/`,
  specimens: (uuid: string) => `/laboratory/orders/${uuid}/specimens/`,
  accession: (uuid: string) => `/laboratory/orders/${uuid}/accession/`,
  report: (uuid: string) => `/laboratory/orders/${uuid}/report/`,
  reportPdf: (uuid: string) => `/laboratory/orders/${uuid}/report.pdf/`,
  orderItemResults: (uuid: string) => `/laboratory/order-items/${uuid}/results/`,
  verify: (uuid: string) =>
    `/laboratory/order-items/${uuid}/results/verify/`,
  release: (uuid: string) =>
    `/laboratory/order-items/${uuid}/results/release/`,
  reject: (uuid: string) =>
    `/laboratory/order-items/${uuid}/results/reject/`,
  specimenReject: (uuid: string) => `/laboratory/specimens/${uuid}/reject/`,
  worklist: (queue: string) => `/laboratory/worklists/${queue}/`,
  specimenTypes: "/laboratory/specimen-types/",
} as const;
