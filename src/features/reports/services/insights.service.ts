import { BFF_INSIGHTS_ROUTES } from "@/constants/api";
import type {
  InsightsFilters,
  SalesActivityResponse,
  SalesByProviderResponse,
  VisitsByPeriodResponse,
} from "@/features/reports/types/insights.types";
import { bffRequest } from "@/lib/bff-client";

function buildInsightsQuery(
  filters: InsightsFilters,
  extra?: Record<string, string>,
): string {
  const params = new URLSearchParams();
  params.set("date_from", filters.dateFrom);
  params.set("date_to", filters.dateTo);
  if (filters.period) {
    params.set("period", filters.period);
  }
  if (filters.clinicUuid) {
    params.set("clinic_uuid", filters.clinicUuid);
  }
  if (filters.paymentMode) {
    params.set("payment_mode", filters.paymentMode);
  }
  if (filters.insuranceSchemeUuid) {
    params.set("insurance_scheme_uuid", filters.insuranceSchemeUuid);
  }
  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      params.set(key, value);
    }
  }
  return `?${params.toString()}`;
}

export async function fetchSalesActivity(
  filters: InsightsFilters,
): Promise<SalesActivityResponse> {
  return bffRequest<SalesActivityResponse>(
    `${BFF_INSIGHTS_ROUTES.salesActivity}${buildInsightsQuery(filters)}`,
  );
}

export async function fetchSalesByProvider(
  filters: InsightsFilters,
  limit = 10,
): Promise<SalesByProviderResponse> {
  return bffRequest<SalesByProviderResponse>(
    `${BFF_INSIGHTS_ROUTES.salesByProvider}${buildInsightsQuery(filters, {
      limit: String(limit),
    })}`,
  );
}

export async function fetchVisitsByPeriod(
  filters: InsightsFilters,
): Promise<VisitsByPeriodResponse> {
  return bffRequest<VisitsByPeriodResponse>(
    `${BFF_INSIGHTS_ROUTES.visitsByPeriod}${buildInsightsQuery(filters)}`,
  );
}
