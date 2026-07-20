import type { StockAdjustment } from "@/features/inventory/types/inventory.types";

export type StockAdjustmentDocumentActionKey =
  | "submit"
  | "cancel"
  | "approve"
  | "reject"
  | "apply";

export function isStockAdjustmentOwner(
  adjustment: Pick<StockAdjustment, "created_by">,
  userId: number | null | undefined,
): boolean {
  return (
    adjustment.created_by != null &&
    userId != null &&
    adjustment.created_by === userId
  );
}

export function getVisibleStockAdjustmentDocumentActions(
  adjustment: Pick<
    StockAdjustment,
    "status" | "created_by" | "allow_self_approval"
  >,
  userId: number | null | undefined,
): StockAdjustmentDocumentActionKey[] {
  const owner = isStockAdjustmentOwner(adjustment, userId);
  const allowSelfApproval = Boolean(adjustment.allow_self_approval);
  const actions: StockAdjustmentDocumentActionKey[] = [];

  if (adjustment.status === "DRAFT") {
    return ["cancel", "submit"];
  }

  if (adjustment.status === "SUBMITTED") {
    const canApprove = !owner || allowSelfApproval;
    actions.push("cancel");
    if (!owner) {
      actions.push("reject");
    }
    if (canApprove) {
      actions.push("approve");
    }
    return actions;
  }

  if (adjustment.status === "APPROVED") {
    actions.push("apply");
  }

  if (
    adjustment.status !== "CANCELLED" &&
    adjustment.status !== "REJECTED" &&
    adjustment.status !== "APPLIED"
  ) {
    actions.push("cancel");
  }

  return actions;
}
