import { describe, expect, it } from "vitest";

import {
  hexToRgb,
  lightenRgb,
  resolveOnPrimaryTextColor,
  resolvePdfBrandPalette,
} from "@/lib/pdf-branding";

describe("pdf-branding", () => {
  it("parses hex colors with or without a hash", () => {
    expect(hexToRgb("#112233", [0, 0, 0])).toEqual([17, 34, 51]);
    expect(hexToRgb("112233", [0, 0, 0])).toEqual([17, 34, 51]);
  });

  it("builds a palette from organization branding colors", () => {
    const palette = resolvePdfBrandPalette({
      branding_logo_url: "",
      branding_primary_color: "#111111",
      branding_secondary_color: "#222222",
      branding_accent_color: "#333333",
    });

    expect(palette.primary).toEqual([17, 17, 17]);
    expect(palette.secondary).toEqual([34, 34, 34]);
    expect(palette.accent).toEqual([51, 51, 51]);
    expect(palette.cardFill).toEqual(lightenRgb([17, 17, 17], 0.94));
  });

  it("falls back to white text on dark primary colors", () => {
    expect(resolveOnPrimaryTextColor([17, 17, 17])).toEqual([255, 255, 255]);
    expect(resolveOnPrimaryTextColor([240, 240, 240])).toEqual([15, 23, 42]);
  });
});
