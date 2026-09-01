import type {
  RemittanceRejectionListFilters,
  RemittanceRejectionListResponse,
  RemittanceRejectionSummaryStats,
} from "@/features/claims/types/remittances.types";
import { BFF_CLAIMS_ROUTES } from "@/constants/api";
import { bffRequest } from "@/lib/bff-client";

function buildRejectionsQuery(
  filters: RemittanceRejectionListFilters = {},
): string {
  const params = new URLSearchParams();
  if (filters.page) {
    params.set("page", String(filters.page));
  }
  if (filters.pageSize) {
    params.set("page_size", String(filters.pageSize));
  }
  if (filters.payerCode) {
    params.set("payer_code", filters.payerCode);
  }
  if (filters.search?.trim()) {
    params.set("search", filters.search.trim());
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function fetchRemittanceRejections(
  filters: RemittanceRejectionListFilters = {},
): Promise<RemittanceRejectionListResponse> {
  return bffRequest<RemittanceRejectionListResponse>(
    `${BFF_CLAIMS_ROUTES.remittanceRejections}${buildRejectionsQuery(filters)}`,
  );
}

export async function fetchRemittanceRejectionSummaryStats(
  filters: Omit<RemittanceRejectionListFilters, "page" | "pageSize"> = {},
): Promise<RemittanceRejectionSummaryStats> {
  return bffRequest<RemittanceRejectionSummaryStats>(
    `${BFF_CLAIMS_ROUTES.remittanceRejectionsSummaryStats}${buildRejectionsQuery(filters)}`,
  );
}
