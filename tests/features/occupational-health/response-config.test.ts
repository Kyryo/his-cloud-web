import { describe, expect, it } from "vitest";

import {
  defaultResponseConfig,
  defaultResponseField,
  defaultResponseFields,
  normalizeResponseConfig,
  normalizeResponseFields,
  resolveEffectiveResponseFields,
} from "@/features/settings/components/modules/occupational-health/template-library/responseConfig";

describe("resolveEffectiveResponseFields", () => {
  it("inherits the section default when override is null", () => {
    const sectionDefault = defaultResponseFields("text");
    const { fields, inherits } = resolveEffectiveResponseFields(sectionDefault, null);
    expect(inherits).toBe(true);
    expect(fields).toHaveLength(1);
    expect(fields[0]?.response_type).toBe("text");
  });

  it("uses the override list when provided", () => {
    const sectionDefault = defaultResponseFields("boolean");
    const override = [defaultResponseField("number", { code: "bp", label: "BP" })];
    const { fields, inherits } = resolveEffectiveResponseFields(sectionDefault, override);
    expect(inherits).toBe(false);
    expect(fields).toHaveLength(1);
    expect(fields[0]?.code).toBe("bp");
    expect(fields[0]?.response_type).toBe("number");
  });

  it("treats an empty override as an explicit empty list", () => {
    const sectionDefault = defaultResponseFields("boolean");
    const { fields, inherits } = resolveEffectiveResponseFields(sectionDefault, []);
    expect(inherits).toBe(false);
    expect(fields).toEqual([]);
  });
});

describe("normalizeResponseFields", () => {
  it("coerces a legacy single config object into one field", () => {
    const fields = normalizeResponseFields({
      response_type: "boolean",
      options: [
        { code: "yes", label: "Yes" },
        { code: "no", label: "No" },
      ],
    });
    expect(fields).toHaveLength(1);
    expect(fields[0]?.code).toBe("field_1");
    expect(fields[0]?.label).toBe("Field 1");
    expect(fields[0]?.response_type).toBe("boolean");
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
    expect(defaultResponseConfig("text").prompt_after_select).toBe(true);
  });
});
