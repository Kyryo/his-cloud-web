import { describe, expect, it } from "vitest";

import {
  formatDateRangeSummary,
  getReportDatePresets,
  getReportSingleDatePresets,
} from "@/features/reports/utils/report-date-presets";

describe("getReportDatePresets", () => {
  const refDate = new Date(2026, 8, 6); // Sep 6, 2026

  it("generates correct presets for reference date", () => {
    const presets = getReportDatePresets(refDate);

    const todayPreset = presets.find((p) => p.id === "today");
    expect(todayPreset?.dateFrom).toBe("2026-09-06");
    expect(todayPreset?.dateTo).toBe("2026-09-06");

    const yesterdayPreset = presets.find((p) => p.id === "yesterday");
    expect(yesterdayPreset?.dateFrom).toBe("2026-09-05");
    expect(yesterdayPreset?.dateTo).toBe("2026-09-05");

    const thisMonthPreset = presets.find((p) => p.id === "this_month");
    expect(thisMonthPreset?.dateFrom).toBe("2026-09-01");
    expect(thisMonthPreset?.dateTo).toBe("2026-09-06");

    const lastMonthPreset = presets.find((p) => p.id === "last_month");
    expect(lastMonthPreset?.dateFrom).toBe("2026-08-01");
    expect(lastMonthPreset?.dateTo).toBe("2026-08-31");
  });
});

describe("getReportSingleDatePresets", () => {
  const refDate = new Date(2026, 8, 6); // Sep 6, 2026

  it("generates correct single date presets", () => {
    const presets = getReportSingleDatePresets(refDate);
    const today = presets.find((p) => p.id === "today");
    expect(today?.date).toBe("2026-09-06");

    const endOfLastMonth = presets.find((p) => p.id === "end_of_last_month");
    expect(endOfLastMonth?.date).toBe("2026-08-31");
  });
});

describe("formatDateRangeSummary", () => {
  it("formats single day range", () => {
    expect(formatDateRangeSummary("2026-09-06", "2026-09-06")).toBe("For 2026-09-06");
  });

  it("formats multi-day range with count", () => {
    expect(formatDateRangeSummary("2026-09-01", "2026-09-07")).toBe(
      "2026-09-01 to 2026-09-07 (7 days)",
    );
  });

  it("handles missing boundaries gracefully", () => {
    expect(formatDateRangeSummary("2026-09-01", undefined)).toBe("From 2026-09-01");
    expect(formatDateRangeSummary(undefined, "2026-09-07")).toBe("Until 2026-09-07");
    expect(formatDateRangeSummary(undefined, undefined)).toBeNull();
  });
});
