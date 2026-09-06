import { describe, expect, it } from "vitest";

import { getReportCatalogItem } from "@/features/reports/constants/report-catalog";
import {
  describeReportFilterChips,
  describeReportPeriod,
  formatReportFileSize,
  formatReportTimestamp,
  groupReportDateFields,
  listActiveReportFilters,
} from "@/features/reports/utils/report-export-summary";

function requireItem(id: string) {
  const item = getReportCatalogItem(id);
  if (!item) {
    throw new Error(`Missing catalog item ${id}`);
  }
  return item;
}

describe("groupReportDateFields", () => {
  it("collapses from/to pairs into a range", () => {
    const group = groupReportDateFields(requireItem("invoices").filters);
    expect(group.kind).toBe("range");
    if (group.kind === "range") {
      expect(group.from.name).toBe("date_from");
      expect(group.to.name).toBe("date_to");
    }
  });

  it("treats a lone date as a single field", () => {
    const group = groupReportDateFields(requireItem("receivables_aging").filters);
    expect(group.kind).toBe("single");
  });
});

describe("describeReportFilterChips", () => {
  it("lists a date range once and every other filter by label", () => {
    expect(describeReportFilterChips(requireItem("sales_orders"))).toEqual([
      "Date range",
      "State",
      "Customer",
      "Provider",
      "Clinic",
    ]);
  });

  it("uses the field label for a single date", () => {
    expect(describeReportFilterChips(requireItem("receivables_aging"))).toEqual([
      "As of date",
      "Customer",
      "Clinic",
    ]);
  });
});

describe("describeReportPeriod", () => {
  const item = requireItem("appointments");

  it("shows a single day when from and to match", () => {
    expect(
      describeReportPeriod(item, {
        scheduled_from: "2026-09-06",
        scheduled_to: "2026-09-06",
      }),
    ).toBe("6 Sept 2026");
  });

  it("shows a range when the dates differ", () => {
    expect(
      describeReportPeriod(item, {
        scheduled_from: "2026-09-01",
        scheduled_to: "2026-09-06",
      }),
    ).toBe("1 Sept 2026 to 6 Sept 2026");
  });

  it("falls back to all time when nothing is set", () => {
    expect(describeReportPeriod(item, {})).toBe("All time");
  });

  it("prefixes single-date reports with as of", () => {
    expect(
      describeReportPeriod(requireItem("receivables_aging"), {
        as_of_date: "2026-08-31",
      }),
    ).toBe("As of 31 Aug 2026");
  });
});

describe("listActiveReportFilters", () => {
  it("resolves select values to their labels and skips empty ones", () => {
    const active = listActiveReportFilters(requireItem("invoices"), {
      date_from: "2026-09-01",
      date_to: "2026-09-06",
      state: "posted",
      customer_uuid: "",
    });

    expect(active).toEqual([{ name: "state", label: "State", value: "Posted" }]);
  });

  it("describes chosen resources without exposing ids", () => {
    const active = listActiveReportFilters(requireItem("invoices"), {
      customer_uuid: "abc-123",
    });

    expect(active).toEqual([
      { name: "customer_uuid", label: "Customer", value: "1 selected" },
    ]);
  });
});

describe("formatReportTimestamp", () => {
  it("formats a valid ISO timestamp for the history list", () => {
    const formatted = formatReportTimestamp("2026-09-06T10:15:00.000Z");
    expect(formatted).not.toBe("2026-09-06T10:15:00.000Z");
    expect(formatted).toMatch(/6 Sep/);
  });

  it("returns the original value when the date is invalid", () => {
    expect(formatReportTimestamp("not-a-date")).toBe("not-a-date");
  });
});

describe("formatReportFileSize", () => {
  it("formats bytes, kilobytes and megabytes", () => {
    expect(formatReportFileSize(0)).toBe("0 KB");
    expect(formatReportFileSize(512)).toBe("512 B");
    expect(formatReportFileSize(2048)).toBe("2.0 KB");
    expect(formatReportFileSize(3 * 1024 * 1024)).toBe("3.0 MB");
  });
});
