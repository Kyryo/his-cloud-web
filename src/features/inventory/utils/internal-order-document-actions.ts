import type { InternalOrder } from "@/features/inventory/types/inventory.types";

export type InternalOrderDocumentActionKey =
  | "submit"
  | "cancel"
  | "approve"
  | "reject"
  | "dispatch"
  | "receive";

export function isInternalOrderOwner(
  order: Pick<InternalOrder, "created_by">,
  userId: number | null | undefined,
): boolean {
  return order.created_by != null && userId != null && order.created_by === userId;
}

export function getVisibleInternalOrderDocumentActions(
  order: Pick<InternalOrder, "status" | "created_by" | "allow_self_approval">,
  userId: number | null | undefined,
): InternalOrderDocumentActionKey[] {
  const owner = isInternalOrderOwner(order, userId);
  const allowSelfApproval = Boolean(order.allow_self_approval);

  if (order.status === "DRAFT" && owner) {
    return ["cancel", "submit"];
  }

  if (order.status === "SUBMITTED") {
    if (owner) {
      return allowSelfApproval ? ["cancel", "approve"] : ["cancel"];
    }
    if (order.created_by != null) {
      return ["reject", "approve"];
    }
  }

  if (order.status === "APPROVED") {
    return ["dispatch"];
  }

  if (order.status === "DISPATCHED") {
    return ["receive"];
  }

  return [];
}
