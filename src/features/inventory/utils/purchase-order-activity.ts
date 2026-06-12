import {
  Ban,
  CheckCircle2,
  FileText,
  NotebookPen,
  Send,
} from "lucide-react";

import type { DetailActivityTimelineItem } from "@/components/detail/detail-activity-timeline";
import type { PurchaseOrder } from "@/features/inventory/types/inventory.types";
import { formatPurchaseStatusLabel } from "@/features/inventory/utils/format-inventory";

export function buildPurchaseOrderActivityItems(
  order: PurchaseOrder,
): DetailActivityTimelineItem[] {
  const items: DetailActivityTimelineItem[] = [
    {
      id: `${order.uuid}-created`,
      title: "Purchase order created",
      summary: `${order.reference_number} was created for ${order.vendor_name}.`,
      occurredAt: order.created_at,
      icon: FileText,
    },
  ];

  if (order.received_at) {
    items.push({
      id: `${order.uuid}-received`,
      title: "Receiving started",
      summary: "The purchase order was opened for receiving.",
      occurredAt: order.received_at,
      icon: Send,
    });
  }

  if (
    order.status === "SUBMITTED" ||
    order.status === "CONFIRMED" ||
    order.status === "CANCELLED"
  ) {
    items.push({
      id: `${order.uuid}-submitted`,
      title: "Submitted for review",
      summary: `${order.reference_number} was submitted for approval.`,
      occurredAt: order.updated_at,
      icon: Send,
    });
  }

  if (order.confirmed_at) {
    items.push({
      id: `${order.uuid}-confirmed`,
      title: "Purchase order confirmed",
      summary: "Stock movements were posted for this purchase order.",
      occurredAt: order.confirmed_at,
      icon: CheckCircle2,
    });
  }

  if (order.status === "CANCELLED") {
    items.push({
      id: `${order.uuid}-cancelled`,
      title: "Purchase order cancelled",
      summary: `${order.reference_number} is now ${formatPurchaseStatusLabel(order.status).toLowerCase()}.`,
      occurredAt: order.updated_at,
      icon: Ban,
    });
  }

  if (order.notes?.trim()) {
    items.push({
      id: `${order.uuid}-notes`,
      title: "Notes updated",
      summary: "Internal notes were saved on this purchase order.",
      occurredAt: order.updated_at,
      icon: NotebookPen,
    });
  }

  return items.sort(
    (left, right) =>
      new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime(),
  );
}
