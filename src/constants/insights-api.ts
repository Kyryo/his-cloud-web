/** Django DRF v1 insights endpoints (relative to HMIS_API_URL, server-only). */
export const INSIGHTS_API_PATHS = {
  salesActivity: "/insights/sales-activity/",
  salesByProvider: "/insights/sales-by-provider/",
  visitsByPeriod: "/insights/visits-by-period/",
} as const;
