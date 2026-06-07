import { describe, expect, it } from "vitest";

import { formatCompactNumber } from "@/utils/format-compact-number";

describe("formatCompactNumber", () => {
  it("keeps values below 1000 unchanged", () => {
    expect(formatCompactNumber(0)).toBe("0");
    expect(formatCompactNumber(42)).toBe("42");
    expect(formatCompactNumber(999)).toBe("999");
  });

  it("uses K suffix from one thousand", () => {
    expect(formatCompactNumber(1000)).toBe("1K");
    expect(formatCompactNumber(1500)).toBe("1.5K");
    expect(formatCompactNumber(999_999)).toBe("1000K");
  });

  it("uses M suffix from one million", () => {
    expect(formatCompactNumber(1_000_000)).toBe("1M");
    expect(formatCompactNumber(2_500_000)).toBe("2.5M");
  });

  it("handles negative values", () => {
    expect(formatCompactNumber(-2500)).toBe("-2.5K");
  });
});
