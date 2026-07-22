import type {
  InsightsFilters,
  InsightsPaymentMode,
  InsightsPeriod,
} from "@/features/reports/types/insights.types";

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
  const paymentMode = params.get("payment_mode");
  return {
    dateFrom: params.get("date_from") ?? defaults.dateFrom,
    dateTo: params.get("date_to") ?? defaults.dateTo,
    period: (period === "week" || period === "month" ? period : "day") as InsightsPeriod,
    clinicUuid: params.get("clinic_uuid") ?? undefined,
    paymentMode:
      paymentMode === "cash" || paymentMode === "insurance"
        ? (paymentMode as InsightsPaymentMode)
        : undefined,
    insuranceSchemeUuid: params.get("insurance_scheme_uuid") ?? undefined,
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
  if (filters.paymentMode) {
    params.set("payment_mode", filters.paymentMode);
  }
  if (filters.insuranceSchemeUuid) {
    params.set("insurance_scheme_uuid", filters.insuranceSchemeUuid);
  }
  return params;
}

/** Select value for the shared overview payment source filter. */
export function paymentSourceFilterValue(filters: InsightsFilters): string {
  if (filters.insuranceSchemeUuid) {
    return filters.insuranceSchemeUuid;
  }
  if (filters.paymentMode === "cash") {
    return "cash";
  }
  if (filters.paymentMode === "insurance") {
    return "insurance";
  }
  return "all";
}

export function paymentSourceFilterToFilters(
  filters: InsightsFilters,
  value: string,
): InsightsFilters {
  if (value === "all") {
    return {
      ...filters,
      paymentMode: undefined,
      insuranceSchemeUuid: undefined,
    };
  }
  if (value === "cash") {
    return {
      ...filters,
      paymentMode: "cash",
      insuranceSchemeUuid: undefined,
    };
  }
  if (value === "insurance") {
    return {
      ...filters,
      paymentMode: "insurance",
      insuranceSchemeUuid: undefined,
    };
  }
  return {
    ...filters,
    paymentMode: "insurance",
    insuranceSchemeUuid: value,
  };
}
