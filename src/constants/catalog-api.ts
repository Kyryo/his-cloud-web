/** Django DRF v1 catalog endpoints (relative to HMIS_API_URL, server-only). */
export const CATALOG_API_PATHS = {
  products: {
    list: "/products/",
    detail: (productUuid: string) => `/products/${productUuid}/`,
    pricelists: (productUuid: string) => `/products/${productUuid}/pricelists/`,
    invoicePolicy: (productUuid: string) => `/products/${productUuid}/invoice-policy/`,
    tariffCodes: (productUuid: string) => `/products/${productUuid}/tariff-codes/`,
    tariffCodeDetail: (productUuid: string, schemeUuid: string) =>
      `/products/${productUuid}/tariff-codes/${schemeUuid}/`,
    stockLocations: (productUuid: string) => `/products/${productUuid}/stock-locations/`,
    auditEvents: (productUuid: string) => `/products/${productUuid}/audit-events/`,
    importTemplate: "/products/import-template/",
    imports: {
      list: "/products/imports/",
      detail: (importUuid: string) => `/products/imports/${importUuid}/`,
      errors: (importUuid: string) => `/products/imports/${importUuid}/errors/`,
      errorFile: (importUuid: string) => `/products/imports/${importUuid}/error-file/`,
      commit: (importUuid: string) => `/products/imports/${importUuid}/commit/`,
      cancel: (importUuid: string) => `/products/imports/${importUuid}/cancel/`,
    },
  },
  pricelists: {
    list: "/pricelists/",
    detail: (pricelistUuid: string) => `/pricelists/${pricelistUuid}/`,
    products: (pricelistUuid: string) => `/pricelists/${pricelistUuid}/products/`,
    productDetail: (pricelistUuid: string, productUuid: string) =>
      `/pricelists/${pricelistUuid}/products/${productUuid}/`,
    approvalConfiguration: "/pricelists/approval-configuration/",
    priceChanges: "/pricelists/price-changes/",
    priceChangeDetail: (changeUuid: string) => `/pricelists/price-changes/${changeUuid}/`,
    confirmPriceChange: (changeUuid: string) =>
      `/pricelists/price-changes/${changeUuid}/confirm/`,
    rejectPriceChange: (changeUuid: string) =>
      `/pricelists/price-changes/${changeUuid}/reject/`,
    auditEvents: (pricelistUuid: string) => `/pricelists/${pricelistUuid}/audit-events/`,
    rules: (pricelistUuid: string) => `/pricelists/${pricelistUuid}/rules/`,
    ruleDetail: (pricelistUuid: string, ruleUuid: string) =>
      `/pricelists/${pricelistUuid}/rules/${ruleUuid}/`,
    copyProducts: (pricelistUuid: string) =>
      `/pricelists/${pricelistUuid}/copy-products/`,
    copyProductsJob: (pricelistUuid: string, jobUuid: string) =>
      `/pricelists/${pricelistUuid}/copy-products/${jobUuid}/`,
    copyProductsJobItems: (pricelistUuid: string, jobUuid: string) =>
      `/pricelists/${pricelistUuid}/copy-products/${jobUuid}/items/`,
    tenantDefault: (tenantUuid: string) => `/tenants/${tenantUuid}/pricelists/default/`,
  },
  auditEvents: "/catalog/audit-events/",
} as const;
