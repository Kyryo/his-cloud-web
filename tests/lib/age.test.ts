import { describe, expect, it } from "vitest";

import {
  calculateAgeParts,
  formatAge,
  formatAgeParts,
} from "@/lib/age";

describe("calculateAgeParts", () => {
  it("returns years, months, and days for a calendar age", () => {
    expect(
      calculateAgeParts("2020-01-15", new Date(2024, 5, 20)),
    ).toEqual({ years: 4, months: 5, days: 5 });
  });

  it("borrows months when the day-of-month has not been reached", () => {
    expect(
      calculateAgeParts("2020-01-25", new Date(2024, 5, 20)),
    ).toEqual({ years: 4, months: 4, days: 26 });
  });

  it("returns null for missing, invalid, or future dates", () => {
    expect(calculateAgeParts(null)).toBeNull();
    expect(calculateAgeParts("")).toBeNull();
    expect(calculateAgeParts("not-a-date")).toBeNull();
    expect(
      calculateAgeParts("2099-01-01", new Date(2024, 0, 1)),
    ).toBeNull();
  });
});

describe("formatAge", () => {
  it("formats compact and long styles", () => {
    const asOf = new Date(2024, 5, 20);
    expect(formatAge("2020-01-15", { asOf })).toBe("4y 5m 5d");
    expect(formatAge("2020-01-15", { asOf, style: "long" })).toBe(
      "4 years, 5 months, 5 days",
    );
  });

  it("uses a custom empty placeholder", () => {
    expect(formatAge(null, { empty: "N/A" })).toBe("N/A");
  });
});

describe("formatAgeParts", () => {
  it("pluralizes long form correctly", () => {
    expect(
      formatAgeParts({ years: 1, months: 1, days: 1 }, "long"),
    ).toBe("1 year, 1 month, 1 day");
  });
});
