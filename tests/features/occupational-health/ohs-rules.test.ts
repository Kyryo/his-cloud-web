import { describe, expect, it } from "vitest";

import {
  OhsRuleError,
  evaluate,
  evaluateBool,
  evaluateComputed,
} from "@/features/occupational-health/lib/ohs-rules/evaluate";

describe("ohs-rules evaluate", () => {
  it("evaluates present / eq / and", () => {
    expect(
      evaluateBool({ op: "present", field: "exam_type" }, { exam_type: "periodic" }),
    ).toBe(true);
    expect(
      evaluate(
        { op: "eq", field: "exam_type", value: "periodic" },
        { exam_type: "periodic" },
      ),
    ).toBe(true);
    expect(
      evaluateBool(
        {
          op: "and",
          args: [
            { op: "present", field: "exam_type" },
            { op: "eq", field: "exam_type", value: "periodic" },
          ],
        },
        { exam_type: "periodic" },
      ),
    ).toBe(true);
  });

  it("computes bmi", () => {
    expect(
      evaluate(
        {
          op: "bmi",
          inputs: { height_cm: "height_cm", weight_kg: "weight_kg" },
        },
        { height_cm: 180, weight_kg: 81 },
      ),
    ).toBe(25);
  });

  it("fails closed on unknown ops", () => {
    expect(() => evaluate({ op: "eval" }, {})).toThrow(OhsRuleError);
  });

  it("evaluateComputed skips incomplete inputs", () => {
    expect(
      evaluateComputed(
        [
          {
            key: "bmi",
            op: "bmi",
            inputs: { height_cm: "height_cm", weight_kg: "weight_kg" },
          },
        ],
        { height_cm: 170 },
      ),
    ).toEqual({});
  });
});
