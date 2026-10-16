import { describe, expect, it } from "vitest";

import {
  availableRanges,
  buildSparklinePaths,
  buildTenantGrowthSeries,
  computeDelta,
  getRecentTenants,
  sliceToRange,
} from "@/features/platform-admin/utils/overview-series";

describe("buildTenantGrowthSeries", () => {
  it("fills gaps and accumulates totals up to the current month", () => {
    const series = buildTenantGrowthSeries(
      [
        { created_at: "2026-07-03T10:00:00Z" },
        { created_at: "2026-07-20T10:00:00Z" },
        { created_at: "2026-09-01T10:00:00Z" },
        { created_at: "not-a-date" },
      ],
      new Date("2026-10-14T00:00:00Z"),
    );
    expect(series).toEqual([
      { month: "2026-07", added: 2, total: 2 },
      { month: "2026-08", added: 0, total: 2 },
      { month: "2026-09", added: 1, total: 3 },
      { month: "2026-10", added: 0, total: 3 },
    ]);
  });

  it("returns an empty series without tenants", () => {
    expect(buildTenantGrowthSeries([])).toEqual([]);
  });
});

describe("ranges", () => {
  it("only offers ranges shorter than the data", () => {
    expect(availableRanges(2)).toEqual(["all"]);
    expect(availableRanges(8)).toEqual([3, 6, "all"]);
    expect(availableRanges(24)).toEqual([3, 6, 12, "all"]);
  });

  it("slices the tail of the series", () => {
    expect(sliceToRange([1, 2, 3, 4], 3)).toEqual([2, 3, 4]);
    expect(sliceToRange([1, 2], "all")).toEqual([1, 2]);
  });
});

describe("computeDelta", () => {
  it("compares the last two values", () => {
    expect(computeDelta([100, 104.25, 101.1])).toEqual({
      current: 101.1,
      previous: 104.25,
      change: -3.2,
      direction: "down",
    });
  });

  it("returns null without enough data", () => {
    expect(computeDelta([5])).toBeNull();
  });
});

describe("getRecentTenants", () => {
  it("sorts newest first and limits", () => {
    const result = getRecentTenants(
      [
        { id: 1, created_at: "2026-01-01" },
        { id: 2, created_at: "2026-03-01" },
        { id: 3, created_at: "2026-02-01" },
      ],
      2,
    );
    expect(result.map((t) => t.id)).toEqual([2, 3]);
  });
});

describe("buildSparklinePaths", () => {
  it("builds line and closed area paths", () => {
    const paths = buildSparklinePaths([0, 10], 100, 20, 0);
    expect(paths).toEqual({
      line: "M0,20 L100,0",
      area: "M0,20 L100,0 L100,20 L0,20 Z",
    });
  });

  it("needs at least two points", () => {
    expect(buildSparklinePaths([1], 100, 20)).toBeNull();
  });
});
