import type {
  DentalPlanItemStatus,
  DentalPlanStatus,
} from "@/features/clinical-dental/types/clinical-dental.types";

export const PLAN_STATUS_LABELS: Record<DentalPlanStatus, string> = {
  draft: "Draft",
  proposed: "Proposed",
  accepted: "Accepted",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const PLAN_ITEM_STATUS_LABELS: Record<DentalPlanItemStatus, string> = {
  planned: "Planned",
  performed: "Performed",
  cancelled: "Cancelled",
};

/** Mirrors ALLOWED_PLAN_TRANSITIONS in api/eportal/dental/services/treatment_plans.py. */
const PLAN_ACTIONS: Record<
  DentalPlanStatus,
  ReadonlyArray<{ status: DentalPlanStatus; label: string }>
> = {
  draft: [
    { status: "proposed", label: "Propose" },
    { status: "accepted", label: "Accept" },
    { status: "cancelled", label: "Cancel plan" },
  ],
  proposed: [
    { status: "accepted", label: "Accept" },
    { status: "draft", label: "Back to draft" },
    { status: "cancelled", label: "Cancel plan" },
  ],
  accepted: [{ status: "cancelled", label: "Cancel plan" }],
  in_progress: [{ status: "cancelled", label: "Cancel plan" }],
  completed: [],
  cancelled: [],
};

export function planStatusActions(status: DentalPlanStatus) {
  return PLAN_ACTIONS[status];
}

export function isPlanOpen(status: DentalPlanStatus): boolean {
  return status !== "completed" && status !== "cancelled";
}

export function canPerformPlanItems(status: DentalPlanStatus): boolean {
  return status === "accepted" || status === "in_progress";
}
