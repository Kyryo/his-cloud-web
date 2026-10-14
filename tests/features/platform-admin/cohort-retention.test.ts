import { describe, expect, it } from "vitest";

import { buildCohortRetentionMatrix } from "@/features/platform-admin/utils/cohort-retention";
import { formatOverviewMoney } from "@/features/platform-admin/utils/overview-format";

describe("buildCohortRetentionMatrix", () => {
  const matrix = buildCohortRetentionMatrix({
    activity_definition: "sales_order_or_invoice",
    cohorts: [
      {
        cohort_month: "2026-02",
        tenant_count: 2,
        months: [{ offset: 0, active_count: 2, retention_rate: 1 }],
      },
      {
        cohort_month: "2026-01",
        tenant_count: 4,
        months: [
          { offset: 0, active_count: 4, retention_rate: 1 },
          { offset: 1, active_count: 3, retention_rate: 0.75 },
        ],
      },
    ],
  });

  it("sorts cohorts chronologically and builds offsets", () => {
    expect(matrix.cohortSizes).toEqual([4, 2]);
    expect(matrix.offsetLabels).toEqual(["M0", "M1"]);
  });

  it("computes per-cohort percentages and heatmap cells", () => {
    expect(matrix.curves[0].points).toEqual([100, 75]);
    expect(matrix.curves[1].points).toEqual([100, null]);
    expect(matrix.cells).toContainEqual({ value: [1, 0, 75, 3] });
  });

  it("computes a tenant-weighted average curve", () => {
    expect(matrix.average).toEqual([100, 75]);
  });

  it("handles empty input", () => {
    const empty = buildCohortRetentionMatrix({
      activity_definition: "x",
      cohorts: [],
    });
    expect(empty.offsetLabels).toEqual([]);
    expect(empty.cells).toEqual([]);
  });
});

describe("formatOverviewMoney", () => {
  it("returns a dash for zero or invalid amounts", () => {
    expect(
      formatOverviewMoney({
        amount: "0",
        currency_code: "USD",
        period_label: "",
      } as never),
    ).toBe("—");
    expect(
      formatOverviewMoney({
        amount: "abc",
        currency_code: "USD",
        period_label: "",
      } as never),
    ).toBe("—");
  });
});
