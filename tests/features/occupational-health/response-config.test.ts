import { describe, expect, it } from "vitest";

import {
  defaultResponseConfig,
  normalizeResponseConfig,
  resolveEffectiveResponseConfig,
} from "@/features/settings/components/modules/occupational-health/template-library/responseConfig";

describe("resolveEffectiveResponseConfig", () => {
  it("inherits the section default when override is null", () => {
    const sectionDefault = defaultResponseConfig("text");
    const { config, inherits } = resolveEffectiveResponseConfig(sectionDefault, null);
    expect(inherits).toBe(true);
    expect(config.response_type).toBe("text");
  });

  it("uses the override when provided", () => {
    const sectionDefault = defaultResponseConfig("boolean");
    const override = defaultResponseConfig("number");
    const { config, inherits } = resolveEffectiveResponseConfig(
      sectionDefault,
      override,
    );
    expect(inherits).toBe(false);
    expect(config.response_type).toBe("number");
  });

  it("defaults prompt_after_select to true and preserves false", () => {
    expect(normalizeResponseConfig({ response_type: "boolean" }).prompt_after_select).toBe(
      true,
    );
    expect(
      normalizeResponseConfig({
        response_type: "boolean",
        prompt_after_select: false,
      }).prompt_after_select,
    ).toBe(false);
  });
});
