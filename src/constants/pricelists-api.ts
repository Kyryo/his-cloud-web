/** Django DRF v1 pricelist endpoints (relative to HMIS_API_URL, server-only). */
export const PRICELISTS_API_PATHS = {
  list: "/pricelists/",
  detail: (id: number | string) => `/pricelists/${id}/`,
  addProduct: (id: number | string) => `/pricelists/${id}/products/`,
  updateProductPrice: (id: number | string, itemId: number | string) =>
    `/pricelists/${id}/products/${itemId}/price/`,
  removeProduct: (id: number | string, itemId: number | string) =>
    `/pricelists/${id}/products/${itemId}/`,
  tenantDefault: (tenantUuid: string) =>
    `/tenants/${tenantUuid}/pricelists/default/`,
} as const;
