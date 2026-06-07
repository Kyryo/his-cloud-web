import { describe, expect, it } from "vitest";

import { validateDateInput } from "@/lib/validate-date-input";

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
});
