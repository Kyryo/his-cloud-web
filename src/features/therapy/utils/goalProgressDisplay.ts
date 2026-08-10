import type { TherapyTreatmentGoal } from "@/features/therapy/types/therapy.types";

export type GoalProgressView = "visit" | "overall";

export function displayedCurrentValue(
  goal: TherapyTreatmentGoal,
  progressView: GoalProgressView,
): number | string | null {
  if (progressView === "overall") {
    return goal.current_value ?? goal.baseline_value;
  }
  if (!goal.visit_has_progress) {
    return null;
  }
  return goal.visit_current_value ?? goal.baseline_value;
}

export function displayedProgressPercentage(
  goal: TherapyTreatmentGoal,
  progressView: GoalProgressView,
): number | null {
  if (progressView === "overall") {
    return goal.progress_percentage;
  }
  if (!goal.visit_has_progress) {
    return null;
  }
  return goal.visit_progress_percentage;
}

export function displayedBooleanResponse(
  goal: TherapyTreatmentGoal,
  progressView: GoalProgressView,
): "Yes" | "No" | "Not recorded" {
  if (progressView === "visit") {
    if (!goal.visit_has_progress) {
      return "Not recorded";
    }
    return goal.visit_measured_value === "1.00" ? "Yes" : "No";
  }
  if (goal.boolean_value === null) {
    return "Not recorded";
  }
  return goal.boolean_value ? "Yes" : "No";
}
