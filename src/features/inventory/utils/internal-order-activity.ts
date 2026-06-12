import {
  Ban,
  CheckCircle2,
  FileText,
  NotebookPen,
  Package,
  Send,
  Truck,
} from "lucide-react";

import type { DetailActivityTimelineItem } from "@/components/detail/detail-activity-timeline";
import type { InternalOrder } from "@/features/inventory/types/inventory.types";
import { formatInternalOrderStatusLabel } from "@/features/inventory/utils/format-inventory";

export function buildInternalOrderActivityItems(
  order: InternalOrder,
): DetailActivityTimelineItem[] {
  const items: DetailActivityTimelineItem[] = [
    {
      id: `${order.uuid}-created`,
      title: "Internal order created",
      summary: `${order.reference_number} was created.`,
      occurredAt: order.created_at,
      icon: FileText,
    },
  ];

  if (order.status !== "DRAFT") {
    items.push({
      id: `${order.uuid}-submitted`,
      title: "Submitted for review",
      summary: `${order.reference_number} was submitted for approval.`,
      occurredAt: order.updated_at,
      icon: Send,
    });
  }

  if (order.approved_at) {
    items.push({
      id: `${order.uuid}-approved`,
      title: "Internal order approved",
      summary: "The transfer request was approved.",
      occurredAt: order.approved_at,
      icon: CheckCircle2,
    });
  }

  if (order.dispatched_at) {
    items.push({
      id: `${order.uuid}-dispatched`,
      title: "Stock dispatched",
      summary: "Items were dispatched from the source location.",
      occurredAt: order.dispatched_at,
      icon: Truck,
    });
  }

  if (order.received_at) {
    items.push({
      id: `${order.uuid}-received`,
      title: "Stock received",
      summary: "Items were received at the destination location.",
      occurredAt: order.received_at,
      icon: Package,
    });
  }

  if (order.status === "REJECTED" || order.status === "CANCELLED") {
    items.push({
      id: `${order.uuid}-terminal`,
      title:
        order.status === "REJECTED"
          ? "Internal order rejected"
          : "Internal order cancelled",
      summary: `${order.reference_number} is now ${formatInternalOrderStatusLabel(order.status).toLowerCase()}.`,
      occurredAt: order.updated_at,
      icon: Ban,
    });
  }

  if (order.notes?.trim()) {
    items.push({
      id: `${order.uuid}-notes`,
      title: "Notes updated",
      summary: "Internal notes were saved on this order.",
      occurredAt: order.updated_at,
      icon: NotebookPen,
    });
  }

  return items.sort(
    (left, right) =>
      new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime(),
  );
}
