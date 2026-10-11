import { describe, expect, it } from "vitest";

import {
  formatCustomerListAge,
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

describe("formatCustomerListAge", () => {
  it("shows months for a client younger than one year", () => {
    const birth = new Date();
    birth.setDate(1);
    birth.setMonth(birth.getMonth() - 4);
    const dob = [
      birth.getFullYear(),
      String(birth.getMonth() + 1).padStart(2, "0"),
      "01",
    ].join("-");

    expect(formatCustomerListAge({ age: 0, dob })).toBe("4 months");
    expect(formatCustomerListAge({ age: 3, dob: "2020-01-01" })).toBe("3 yrs");
    expect(formatCustomerListAge({ age: 0, dob: "" })).toBeNull();
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
