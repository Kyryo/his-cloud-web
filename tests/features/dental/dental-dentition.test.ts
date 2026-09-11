import { describe, expect, it } from "vitest";

import {
  filterTeethForDentition,
  fromChartFdi,
  getPermanentFdiToothNumbers,
  getPrimaryFdiToothNumbers,
  inferDentitionMode,
  maxTeethForDentition,
  mergeSelectAllTeeth,
  toChartIds,
} from "@/features/dental/lib/dental-dentition";

describe("dental-dentition", () => {
  it("lists 32 permanent and 20 primary FDI numbers", () => {
    expect(getPermanentFdiToothNumbers()).toHaveLength(32);
    expect(getPrimaryFdiToothNumbers()).toHaveLength(20);
    expect(getPrimaryFdiToothNumbers()).toContain(51);
    expect(getPrimaryFdiToothNumbers()).toContain(85);
  });

  it("maps chart FDI to primary FDI in children mode", () => {
    expect(fromChartFdi(11, "children")).toBe(51);
    expect(fromChartFdi(14, "children")).toBe(54);
    expect(fromChartFdi(25, "children")).toBe(65);
    expect(fromChartFdi(45, "children")).toBe(85);
    expect(fromChartFdi(16, "children")).toBeNull();
    expect(fromChartFdi(11, "adult")).toBe(11);
    expect(fromChartFdi(51, "adult")).toBeNull();
  });

  it("maps stored FDI to chart IDs", () => {
    expect(toChartIds([11, 51, 54], "adult")).toEqual(["teeth-11"]);
    expect(toChartIds([11, 51, 54], "children")).toEqual([
      "teeth-11",
      "teeth-14",
    ]);
  });

  it("filters by dentition", () => {
    expect(filterTeethForDentition([11, 21, 51, 85], "adult")).toEqual([
      11, 21,
    ]);
    expect(filterTeethForDentition([11, 21, 51, 85], "children")).toEqual([
      51, 85,
    ]);
  });

  it("infers children mode only when primary-only", () => {
    expect(inferDentitionMode([])).toBe("adult");
    expect(inferDentitionMode([11, 12])).toBe("adult");
    expect(inferDentitionMode([51, 61])).toBe("children");
    expect(inferDentitionMode([11, 51])).toBe("adult");
  });

  it("uses maxTeeth 8 for adult and 5 for children", () => {
    expect(maxTeethForDentition("adult")).toBe(8);
    expect(maxTeethForDentition("children")).toBe(5);
  });

  it("merges select-all while preserving the other dentition", () => {
    const primary = getPrimaryFdiToothNumbers();
    expect(mergeSelectAllTeeth([11, 51, 85], primary)).toEqual(
      [11, ...primary].sort((a, b) => a - b),
    );
    const permanent = getPermanentFdiToothNumbers();
    expect(mergeSelectAllTeeth([11, 51], permanent)).toEqual(
      [...permanent, 51].sort((a, b) => a - b),
    );
  });
});
