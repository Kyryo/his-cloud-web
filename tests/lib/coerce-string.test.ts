import { describe, expect, it } from "vitest";

import { coerceToOptionalString } from "@/lib/coerce-string";

describe("coerceToOptionalString", () => {
  it("returns empty string for nullish values", () => {
    expect(coerceToOptionalString(null)).toBe("");
    expect(coerceToOptionalString(undefined)).toBe("");
  });

  it("trims string values", () => {
    expect(coerceToOptionalString("  SP-1  ")).toBe("SP-1");
  });

  it("coerces numbers and other primitives", () => {
    expect(coerceToOptionalString(12345)).toBe("12345");
    expect(coerceToOptionalString(0)).toBe("0");
  });
});
