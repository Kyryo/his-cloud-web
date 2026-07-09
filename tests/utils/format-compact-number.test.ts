import { describe, expect, it } from "vitest";

import {
  formatCompactAmount,
  formatCompactNumber,
} from "@/utils/format-compact-number";

describe("formatCompactNumber", () => {
  it("keeps values below 1000 unchanged", () => {
    expect(formatCompactNumber(0)).toBe("0");
    expect(formatCompactNumber(42)).toBe("42");
    expect(formatCompactNumber(999)).toBe("999");
  });

  it("uses k suffix from one thousand", () => {
    expect(formatCompactNumber(1000)).toBe("1k");
    expect(formatCompactNumber(1500)).toBe("1.5k");
    expect(formatCompactNumber(999_999)).toBe("1000k");
  });

  it("uses M suffix from one million", () => {
    expect(formatCompactNumber(1_000_000)).toBe("1M");
    expect(formatCompactNumber(2_500_000)).toBe("2.5M");
  });

  it("uses B suffix from one billion", () => {
    expect(formatCompactNumber(1_000_000_000)).toBe("1B");
    expect(formatCompactNumber(2_500_000_000)).toBe("2.5B");
  });

  it("handles negative values", () => {
    expect(formatCompactNumber(-2500)).toBe("-2.5k");
  });
});

describe("formatCompactAmount", () => {
  it("formats numeric strings compactly", () => {
    expect(formatCompactAmount("1500")).toBe("1.5k");
    expect(formatCompactAmount(2_500_000)).toBe("2.5M");
  });

  it("returns dash for empty values", () => {
    expect(formatCompactAmount(null)).toBe("—");
    expect(formatCompactAmount("")).toBe("—");
  });
});
