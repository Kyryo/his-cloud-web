import { getReportCatalogItem } from "@/features/reports/constants/report-catalog";
import { defaultInsightsFilters } from "@/features/reports/utils/insights-filters";

export function defaultReportFilterValues(reportId: string): Record<string, string> {
  const item = getReportCatalogItem(reportId);
  if (!item) {
    return {};
  }

  const defaults = defaultInsightsFilters();
  const values: Record<string, string> = {};

  for (const field of item.filters) {
    if (field.name === "date_from") {
      values[field.name] = defaults.dateFrom;
    } else if (field.name === "date_to") {
      values[field.name] = defaults.dateTo;
    } else if (field.name === "as_of_date") {
      values[field.name] = defaults.dateTo;
    } else {
      values[field.name] = "";
    }
  }

  return values;
}
