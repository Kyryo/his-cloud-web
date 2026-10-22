import { describe, expect, it } from "vitest";

import { dentalFindingSchema } from "@/features/clinical-dental/schemas/dental-finding.schema";
import {
  dentalProcedureSchema,
  parseToothList,
  toDentalPlanItemPayload,
} from "@/features/clinical-dental/schemas/dental-plan.schema";
import { toothName } from "@/features/clinical-dental/utils/dental-arches";
import {
  planStatusActions,
  canPerformPlanItems,
} from "@/features/clinical-dental/utils/dental-plan-status";

describe("dental schemas", () => {
  it("parses FDI tooth lists and rejects non-FDI numbers", () => {
    expect(parseToothList("37, 36 36;46")).toEqual([36, 37, 46]);
    expect(parseToothList("")).toEqual([]);
    expect(parseToothList("19")).toBeNull();
    expect(parseToothList("56")).toBeNull();
    expect(parseToothList("3")).toBeNull();
  });

  it("validates findings against FDI teeth and known conditions", () => {
    expect(
      dentalFindingSchema.safeParse({
        tooth_number: 36,
        condition: "caries",
        surfaces: ["O"],
        notes: "",
      }).success,
    ).toBe(true);
    expect(
      dentalFindingSchema.safeParse({
        tooth_number: 9,
        condition: "caries",
        surfaces: [],
        notes: "",
      }).success,
    ).toBe(false);
    expect(
      dentalFindingSchema.safeParse({
        tooth_number: 36,
        condition: "decay",
        surfaces: [],
        notes: "",
      }).success,
    ).toBe(false);
  });

  it("maps procedure form values to the plan item payload", () => {
    const values = dentalProcedureSchema.parse({
      product_uuid: "prod-1",
      teeth: "36 37",
      surfaces: ["O"],
      estimated_price: "15000",
      notes: "",
    });

    expect(toDentalPlanItemPayload(values)).toEqual({
      product_uuid: "prod-1",
      tooth_numbers: [36, 37],
      surfaces: ["O"],
      estimated_price: "15000",
      notes: "",
    });
    expect(
      dentalProcedureSchema.safeParse({ ...values, estimated_price: "12.345" }).success,
    ).toBe(false);
  });

  it("names teeth for screen readers", () => {
    expect(toothName(36)).toBe("Lower left first molar");
    expect(toothName(53)).toBe("Upper right primary canine");
  });

  it("only allows perform on accepted or in-progress plans", () => {
    expect(canPerformPlanItems("accepted")).toBe(true);
    expect(canPerformPlanItems("draft")).toBe(false);
    expect(planStatusActions("draft").map((action) => action.status)).toEqual([
      "proposed",
      "accepted",
      "cancelled",
    ]);
    expect(planStatusActions("completed")).toEqual([]);
  });
});
