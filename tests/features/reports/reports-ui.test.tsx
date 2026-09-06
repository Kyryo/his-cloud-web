import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ReportExportShell } from "@/features/reports/components/ReportExportShell";
import { ReportsCatalogList } from "@/features/reports/components/ReportsCatalogList";
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
      <ReportsCatalogList />
    </ReportExportShell>,
  );
}

afterEach(() => {
  cleanup();
});

describe("ReportsCatalogList", () => {
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

  it("opens a dialog instead of a sheet when a report is selected", () => {
    renderCatalog();

    fireEvent.click(screen.getByTestId("report-catalog-appointments"));

    expect(screen.getByTestId("report-export-dialog")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Export CSV" })).toBeInTheDocument();
    expect(screen.queryByTestId("report-export-sheet")).not.toBeInTheDocument();
  });

  it("applies a quick period preset and reflects it in the summary rail", () => {
    renderCatalog();

    fireEvent.click(screen.getByTestId("report-catalog-appointments"));

    const todayChip = screen.getByRole("button", { name: "Today" });
    expect(todayChip).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(screen.getByRole("button", { name: "Last 7 days" }));

    const fromInput = screen.getByLabelText("From") as HTMLInputElement;
    const toInput = screen.getByLabelText("To") as HTMLInputElement;
    expect(fromInput.value).not.toBe(toInput.value);
    expect(screen.getByRole("button", { name: "Last 7 days" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(
      screen.getByTestId("report-export-summary-period").textContent,
    ).toContain(" to ");
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
