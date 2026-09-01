import { describe, expect, it } from "vitest";

import { resolveTagBadgeStyle } from "@/features/tags/utils/resolve-tag-badge-style";

describe("resolveTagBadgeStyle", () => {
  it("uses the default tint style when no color is provided", () => {
    expect(resolveTagBadgeStyle("")).toEqual({
      className: "border-brand-border bg-brand-tint text-brand-navy",
    });
  });

  it("uses dark text on light backgrounds", () => {
    expect(resolveTagBadgeStyle("#fef08a").style).toEqual({
      backgroundColor: "#fef08a",
      color: "#1e293b",
      borderColor: "#fef08a",
    });
  });

  it("uses white text on dark backgrounds", () => {
    expect(resolveTagBadgeStyle("#2563eb").style).toEqual({
      backgroundColor: "#2563eb",
      color: "#ffffff",
      borderColor: "#2563eb",
    });
  });

  it("adds a neutral border for white backgrounds", () => {
    expect(resolveTagBadgeStyle("#ffffff")).toEqual({
      className: "border-brand-border",
      style: {
        backgroundColor: "#ffffff",
        color: "#1e293b",
        borderColor: undefined,
      },
    });
  });
});
