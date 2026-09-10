import { BFF_RECEIVABLES_ROUTES } from "@/constants/api";
import type {
  ReceivablesDebtorListResponse,
  ReceivablesInvoiceListResponse,
  ReceivablesListFilters,
  ReceivablesSummaryStats,
} from "@/features/receivables/types/receivables.types";
import { bffRequest } from "@/lib/bff-client";

function buildReceivablesQuery(filters: ReceivablesListFilters = {}): string {
  const params = new URLSearchParams();

  if (filters.page) {
    params.set("page", String(filters.page));
  }
  if (filters.pageSize) {
    params.set("page_size", String(filters.pageSize));
  }
  if (filters.search?.trim()) {
    params.set("search", filters.search.trim());
  }
  if (filters.agingBucket) {
    params.set("aging_bucket", filters.agingBucket);
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function fetchReceivablesDebtors(
  filters: ReceivablesListFilters = {},
): Promise<ReceivablesDebtorListResponse> {
  return bffRequest<ReceivablesDebtorListResponse>(
    `${BFF_RECEIVABLES_ROUTES.debtors}${buildReceivablesQuery(filters)}`,
  );
}

export async function fetchReceivablesInvoices(
  filters: ReceivablesListFilters = {},
): Promise<ReceivablesInvoiceListResponse> {
  return bffRequest<ReceivablesInvoiceListResponse>(
    `${BFF_RECEIVABLES_ROUTES.invoices}${buildReceivablesQuery(filters)}`,
  );
}

export async function fetchReceivablesSummaryStats(): Promise<ReceivablesSummaryStats> {
  return bffRequest<ReceivablesSummaryStats>(BFF_RECEIVABLES_ROUTES.summaryStats);
}
