import { describe, expect, it } from "vitest";

import {
  formatPartialIsoDateInput,
  validateDateInput,
} from "@/lib/validate-date-input";

describe("formatPartialIsoDateInput", () => {
  it("inserts a dash after the year when typing forward", () => {
    expect(formatPartialIsoDateInput("1990", "199")).toBe("1990-");
  });

  it("inserts a dash after the month when typing forward", () => {
    expect(formatPartialIsoDateInput("199005", "1990-0")).toBe("1990-05-");
  });

  it("formats a full date", () => {
    expect(formatPartialIsoDateInput("19900515", "")).toBe("1990-05-15");
  });

  it("formats pasted digits without requiring previous value", () => {
    expect(formatPartialIsoDateInput("19900515")).toBe("1990-05-15");
  });

  it("does not re-add a trailing dash when deleting", () => {
    expect(formatPartialIsoDateInput("1990", "1990-")).toBe("1990");
    expect(formatPartialIsoDateInput("1990-05", "1990-05-")).toBe("1990-05");
  });

  it("strips non-digits and caps at 8 digits", () => {
    expect(formatPartialIsoDateInput("1990-05-15x99", "")).toBe("1990-05-15");
  });
});

describe("validateDateInput", () => {
  it("returns null for empty optional input", () => {
    expect(validateDateInput("")).toBeNull();
  });

  it("rejects invalid month while typing", () => {
    expect(validateDateInput("2020-20-11")).toBe(
      "Enter a valid month (01–12).",
    );
  });

  it("rejects future dates for date of birth", () => {
    expect(
      validateDateInput("2027-11-11", {
        futureMessage: "Date of birth cannot be in the future.",
      }),
    ).toBe("Date of birth cannot be in the future.");
  });

  it("rejects impossible calendar dates", () => {
    expect(validateDateInput("2020-02-30")).toBe(
      "This month only has 29 days.",
    );
  });

  it("rejects malformed input", () => {
    expect(validateDateInput("2020/11/11")).toBe("Use the format YYYY-MM-DD.");
  });

  it("accepts valid past dates", () => {
    expect(validateDateInput("1990-05-15")).toBeNull();
  });

  it("accepts partial dates with auto-inserted trailing dashes", () => {
    expect(validateDateInput("1990-")).toBeNull();
    expect(validateDateInput("1990-05-")).toBeNull();
  });
});
