import { describe, expect, it } from "vitest";

import { formatCapitalizedName } from "@/utils/format-capitalized-name";

describe("formatCapitalizedName", () => {
  it("capitalizes each word and lowercases the rest", () => {
    expect(formatCapitalizedName("OWEN ONIONS")).toBe("Owen Onions");
    expect(formatCapitalizedName("owen onions")).toBe("Owen Onions");
    expect(formatCapitalizedName("oWeN oNiOnS")).toBe("Owen Onions");
  });

  it("handles single words", () => {
    expect(formatCapitalizedName("ADA")).toBe("Ada");
    expect(formatCapitalizedName("ada")).toBe("Ada");
  });

  it("trims and collapses extra whitespace", () => {
    expect(formatCapitalizedName("  owen   onions  ")).toBe("Owen Onions");
  });

  it("returns empty string for blank input", () => {
    expect(formatCapitalizedName("")).toBe("");
    expect(formatCapitalizedName("   ")).toBe("");
  });
});
