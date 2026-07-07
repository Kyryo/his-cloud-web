import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ReportExportShell } from "@/features/reports/components/ReportExportShell";
import { ReportsCatalogGrid } from "@/features/reports/components/ReportsCatalogGrid";
import { buildReportFiltersPayload } from "@/features/reports/components/ReportFilterForm";
import {
  getReportCatalogSections,
  REPORT_CATALOG,
} from "@/features/reports/constants/report-catalog";
import {
  defaultInsightsFilters,
  insightsFiltersFromSearchParams,
} from "@/features/reports/utils/insights-filters";

function renderCatalog() {
  return render(
    <ReportExportShell>
      <ReportsCatalogGrid />
    </ReportExportShell>,
  );
}

describe("ReportsCatalogGrid", () => {
  it("renders categorized catalog report buttons", () => {
    renderCatalog();

    for (const section of getReportCatalogSections()) {
      expect(screen.getByText(section.title)).toBeInTheDocument();
    }

    for (const report of REPORT_CATALOG) {
      expect(screen.getByTestId(`report-catalog-${report.id}`)).toBeInTheDocument();
      expect(screen.getByText(report.title)).toBeInTheDocument();
    }
  });
});

describe("buildReportFiltersPayload", () => {
  it("omits empty filter values", () => {
    expect(
      buildReportFiltersPayload({
        date_from: "2026-01-01",
        date_to: "",
        state: "posted",
      }),
    ).toEqual({
      date_from: "2026-01-01",
      state: "posted",
    });
  });
});

describe("insightsFiltersFromSearchParams", () => {
  it("defaults to the current month when params are missing", () => {
    const filters = insightsFiltersFromSearchParams(new URLSearchParams());
    const defaults = defaultInsightsFilters();
    expect(filters.dateFrom).toBe(defaults.dateFrom);
    expect(filters.dateTo).toBe(defaults.dateTo);
    expect(filters.period).toBe("day");
  });
});
