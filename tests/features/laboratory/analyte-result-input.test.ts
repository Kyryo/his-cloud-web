import { describe, expect, it } from "vitest";

import {
  formatAnalyteReferenceRange,
  isNumericOutOfReferenceRange,
  sanitizeAnalyteNumericInput,
} from "@/features/laboratory/utils/analyte-result-input";

describe("formatAnalyteReferenceRange", () => {
  it("formats low and high bounds", () => {
    expect(formatAnalyteReferenceRange(3.5, 5.5)).toBe("3.5 – 5.5");
    expect(formatAnalyteReferenceRange(3.5, null)).toBe("≥ 3.5");
    expect(formatAnalyteReferenceRange(null, 5.5)).toBe("≤ 5.5");
    expect(formatAnalyteReferenceRange(null, null)).toBeNull();
  });
});

describe("isNumericOutOfReferenceRange", () => {
  it("detects values outside the normal range", () => {
    expect(isNumericOutOfReferenceRange("2", 3.5, 5.5)).toBe(true);
    expect(isNumericOutOfReferenceRange("6", 3.5, 5.5)).toBe(true);
    expect(isNumericOutOfReferenceRange("4", 3.5, 5.5)).toBe(false);
    expect(isNumericOutOfReferenceRange("", 3.5, 5.5)).toBe(false);
  });
});

describe("sanitizeAnalyteNumericInput", () => {
  it("blocks letters and enforces integer precision", () => {
    expect(sanitizeAnalyteNumericInput("12a3", 0)).toBe("123");
    expect(sanitizeAnalyteNumericInput("12.5", 0)).toBe("125");
    expect(sanitizeAnalyteNumericInput("-12a", 0)).toBe("-12");
  });

  it("allows decimals up to the configured precision", () => {
    expect(sanitizeAnalyteNumericInput("12.345", 2)).toBe("12.34");
    expect(sanitizeAnalyteNumericInput("12.3a4b", 3)).toBe("12.34");
    expect(sanitizeAnalyteNumericInput("-1.2.3", null)).toBe("-1.23");
  });
});
