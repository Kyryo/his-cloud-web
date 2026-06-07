import { describe, expect, it } from "vitest";

import {
  getCountryCodeFromName,
  getCountryNameFromCode,
  getPrioritizedCountryCodes,
} from "@/features/auth/constants/countries";

describe("countries", () => {
  it("resolves country names from ISO codes", () => {
    expect(getCountryNameFromCode("MW")).toBe("Malawi");
    expect(getCountryNameFromCode("US")).toBe("United States");
  });

  it("resolves ISO codes from country names", () => {
    expect(getCountryCodeFromName("Malawi")).toBe("MW");
    expect(getCountryCodeFromName("United States")).toBe("US");
  });

  it("prioritizes Malawi by default", () => {
    expect(getPrioritizedCountryCodes()[0]).toBe("MW");
  });

  it("prioritizes the tenant country when available", () => {
    const countries = getPrioritizedCountryCodes("Kenya");
    expect(countries[0]).toBe("KE");
    expect(countries).toContain("MW");
    expect(countries.indexOf("MW")).toBeGreaterThan(0);
  });
});
