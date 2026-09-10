/** Django DRF v1 receivables endpoints (relative to HMIS_API_URL, server-only). */
export const RECEIVABLES_API_PATHS = {
  debtors: "/receivables/debtors/",
  invoices: "/receivables/invoices/",
  summaryStats: "/receivables/summary-stats/",
} as const;
