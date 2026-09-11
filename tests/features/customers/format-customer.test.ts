import { describe, expect, it } from "vitest";

import {
  formatDisplayDate,
  formatDisplayDateTime,
  looksLikeClientName,
  splitClientSearchName,
} from "@/features/customers/utils/format-customer";

describe("formatDisplayDateTime", () => {
  it("formats ISO timestamps for display", () => {
    const formatted = formatDisplayDateTime("2024-06-15T14:30:00.000Z");
    expect(formatted).toContain("2024");
    expect(formatted).toContain("Jun");
  });

  it("returns the original value for invalid dates", () => {
    expect(formatDisplayDateTime("not-a-date")).toBe("not-a-date");
    expect(formatDisplayDate("not-a-date")).toBe("not-a-date");
  });
});

describe("looksLikeClientName", () => {
  it("accepts person names and rejects identifiers or phones", () => {
    expect(looksLikeClientName("Tahir")).toBe(true);
    expect(looksLikeClientName("Mary-Jane O'Brien")).toBe(true);
    expect(looksLikeClientName("0712345678")).toBe(false);
    expect(looksLikeClientName("CLINIC-0001")).toBe(false);
  });
});

describe("splitClientSearchName", () => {
  it("splits typed search names into form fields", () => {
    expect(splitClientSearchName("Ada")).toEqual({
      first_name: "Ada",
      middle_name: "",
      last_name: "",
    });
    expect(splitClientSearchName("Ada Lovelace")).toEqual({
      first_name: "Ada",
      middle_name: "",
      last_name: "Lovelace",
    });
    expect(splitClientSearchName("Ada Augusta Lovelace")).toEqual({
      first_name: "Ada",
      middle_name: "Augusta",
      last_name: "Lovelace",
    });
  });
});
