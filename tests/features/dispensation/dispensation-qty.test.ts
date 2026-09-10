import { describe, expect, it } from "vitest";

import {
  formatDispensationQuantity,
  formatPharmacyQueueDispenseStatusLabel,
  getLineDispenseStatus,
  getPharmacyQueueDispenseStatus,
  isLineFullyDispensed,
  remainingQuantity,
  summarizeQueueLines,
} from "@/features/dispensation/utils/dispensation-qty";

describe("remainingQuantity", () => {
  it("subtracts dispensed from ordered", () => {
    expect(remainingQuantity("5", "2")).toBe(3);
    expect(remainingQuantity(5, 5)).toBe(0);
  });
});

describe("isLineFullyDispensed", () => {
  it("returns true when remaining is zero", () => {
    expect(
      isLineFullyDispensed({ quantity: "4", dispensed_quantity: "4" }),
    ).toBe(true);
    expect(
      isLineFullyDispensed({ quantity: "4", dispensed_quantity: "1" }),
    ).toBe(false);
  });
});

describe("formatDispensationQuantity", () => {
  it("formats numeric quantities", () => {
    expect(formatDispensationQuantity("2.5000")).toContain("2.5");
  });
});

describe("getPharmacyQueueDispenseStatus", () => {
  it("returns waiting when no lines have been dispensed", () => {
    expect(
      getPharmacyQueueDispenseStatus({
        dispensable_line_count: 3,
        remaining_line_count: 3,
      }),
    ).toBe("waiting");
  });

  it("returns partial when some lines remain", () => {
    expect(
      getPharmacyQueueDispenseStatus({
        dispensable_line_count: 3,
        remaining_line_count: 1,
      }),
    ).toBe("partial");
  });

  it("returns complete when nothing remains", () => {
    expect(
      getPharmacyQueueDispenseStatus({
        dispensable_line_count: 3,
        remaining_line_count: 0,
      }),
    ).toBe("complete");
  });
});

describe("formatPharmacyQueueDispenseStatusLabel", () => {
  it("labels each status", () => {
    expect(formatPharmacyQueueDispenseStatusLabel("waiting")).toBe("Waiting");
    expect(formatPharmacyQueueDispenseStatusLabel("partial")).toBe("Partial");
    expect(formatPharmacyQueueDispenseStatusLabel("complete")).toBe("Complete");
  });
});

describe("getLineDispenseStatus", () => {
  it("classifies a line from dispensed versus ordered", () => {
    expect(
      getLineDispenseStatus({ quantity: "4", dispensed_quantity: "0" }),
    ).toBe("waiting");
    expect(
      getLineDispenseStatus({ quantity: "4", dispensed_quantity: "2" }),
    ).toBe("partial");
    expect(
      getLineDispenseStatus({ quantity: "4", dispensed_quantity: "4" }),
    ).toBe("complete");
  });
});

describe("summarizeQueueLines", () => {
  it("rolls up remaining lines and progress", () => {
    expect(
      summarizeQueueLines([
        { quantity: "4", dispensed_quantity: "0" },
        { quantity: "6", dispensed_quantity: "6" },
      ]),
    ).toEqual({
      lineCount: 2,
      remainingLineCount: 1,
      orderedQuantity: 10,
      dispensedQuantity: 6,
      remainingQuantity: 4,
      status: "partial",
      progressPercent: 60,
    });
  });
});
