import { describe, expect, it } from "vitest";

import {
  formatDispensationQuantity,
  formatPharmacyQueueDispenseStatusLabel,
  getPharmacyQueueDispenseStatus,
  isLineFullyDispensed,
  remainingQuantity,
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
