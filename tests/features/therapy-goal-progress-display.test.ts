import { describe, expect, it } from "vitest";

import type { TherapyTreatmentGoal } from "@/features/therapy/types/therapy.types";
import {
  displayedBooleanResponse,
  displayedCurrentValue,
  displayedProgressPercentage,
} from "@/features/therapy/utils/goalProgressDisplay";

function buildGoal(
  overrides: Partial<TherapyTreatmentGoal> = {},
): TherapyTreatmentGoal {
  return {
    uuid: "goal-1",
    treatment_plan: "plan-1",
    description: "Walk ten meters",
    unit: "meters",
    unit_custom_label: "",
    baseline_value: "2",
    target_value: "10",
    target_date: null,
    boolean_value: null,
    is_achieved: false,
    achieved_at: null,
    notes: "",
    current_value: 10,
    progress_percentage: 100,
    visit_measured_value: "3.00",
    visit_current_value: 5,
    visit_progress_percentage: 37.5,
    visit_has_progress: true,
    progress_logs: [],
    ...overrides,
  };
}

describe("goalProgressDisplay", () => {
  it("uses visit fields by default when progress was recorded", () => {
    const goal = buildGoal();

    expect(displayedCurrentValue(goal, "visit")).toBe(5);
    expect(displayedProgressPercentage(goal, "visit")).toBe(37.5);
  });

  it("uses overall fields when overall view is selected", () => {
    const goal = buildGoal();

    expect(displayedCurrentValue(goal, "overall")).toBe(10);
    expect(displayedProgressPercentage(goal, "overall")).toBe(100);
  });

  it("returns null visit progress when this visit has no log", () => {
    const goal = buildGoal({
      visit_has_progress: false,
      visit_measured_value: null,
      visit_current_value: 2,
      visit_progress_percentage: 0,
    });

    expect(displayedCurrentValue(goal, "visit")).toBeNull();
    expect(displayedProgressPercentage(goal, "visit")).toBeNull();
    expect(displayedCurrentValue(goal, "overall")).toBe(10);
  });

  it("maps boolean visit measurements independently of overall response", () => {
    const goal = buildGoal({
      unit: "boolean",
      boolean_value: true,
      visit_measured_value: "0.00",
      visit_has_progress: true,
    });

    expect(displayedBooleanResponse(goal, "visit")).toBe("No");
    expect(displayedBooleanResponse(goal, "overall")).toBe("Yes");
  });
});
