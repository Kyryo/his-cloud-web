import type { InsightsFilters, InsightsPeriod } from "@/features/reports/types/insights.types";

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function defaultInsightsFilters(): InsightsFilters {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  return {
    dateFrom: formatDate(start),
    dateTo: formatDate(today),
    period: "day",
  };
}

export function insightsFiltersFromSearchParams(
  params: URLSearchParams,
): InsightsFilters {
  const defaults = defaultInsightsFilters();
  const period = params.get("period");
  return {
    dateFrom: params.get("date_from") ?? defaults.dateFrom,
    dateTo: params.get("date_to") ?? defaults.dateTo,
    period: (period === "week" || period === "month" ? period : "day") as InsightsPeriod,
    clinicUuid: params.get("clinic_uuid") ?? undefined,
  };
}

export function insightsFiltersToSearchParams(
  filters: InsightsFilters,
): URLSearchParams {
  const params = new URLSearchParams();
  params.set("date_from", filters.dateFrom);
  params.set("date_to", filters.dateTo);
  if (filters.period) {
    params.set("period", filters.period);
  }
  if (filters.clinicUuid) {
    params.set("clinic_uuid", filters.clinicUuid);
  }
  return params;
}
