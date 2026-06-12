import type { PurchaseOrder } from "@/features/inventory/types/inventory.types";

export type PurchaseOrderDocumentActionKey =
  | "submit"
  | "cancel"
  | "approve"
  | "reject";

export function isPurchaseOrderOwner(
  order: Pick<PurchaseOrder, "created_by">,
  userId: number | null | undefined,
): boolean {
  return order.created_by != null && userId != null && order.created_by === userId;
}

export function getVisiblePurchaseOrderDocumentActions(
  order: Pick<PurchaseOrder, "status" | "created_by">,
  userId: number | null | undefined,
): PurchaseOrderDocumentActionKey[] {
  const owner = isPurchaseOrderOwner(order, userId);

  if (order.status === "DRAFT" && owner) {
    return ["cancel", "submit"];
  }

  if (order.status === "SUBMITTED") {
    if (owner) {
      return ["cancel"];
    }

    if (!owner && order.created_by != null) {
      return ["reject", "approve"];
    }
  }

  return [];
}
