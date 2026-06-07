import { describe, expect, it } from "vitest";

import {
  joinDisplayName,
  splitDisplayName,
} from "@/features/settings/utils/user-name";

describe("splitDisplayName", () => {
  it("splits a full name into first and last segments", () => {
    expect(splitDisplayName("Ada Lovelace")).toEqual({
      firstName: "Ada",
      lastName: "Lovelace",
    });
  });

  it("returns the whole token as first name when only one word is present", () => {
    expect(splitDisplayName("Ada")).toEqual({
      firstName: "Ada",
      lastName: "",
    });
  });

  it("returns empty values for blank input", () => {
    expect(splitDisplayName("   ")).toEqual({
      firstName: "",
      lastName: "",
    });
  });
});

describe("joinDisplayName", () => {
  it("joins first and last names", () => {
    expect(joinDisplayName("Ada", "Lovelace")).toBe("Ada Lovelace");
  });

  it("drops empty segments", () => {
    expect(joinDisplayName("Ada", "")).toBe("Ada");
  });
});
