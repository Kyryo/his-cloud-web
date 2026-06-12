"use client";

import { Activity } from "lucide-react";

import { DetailActivityTimeline } from "@/components/detail/detail-activity-timeline";
import { DetailTabEmptyState } from "@/components/detail/detail-tab-empty-state";
import type { PurchaseOrder } from "@/features/inventory/types/inventory.types";
import { buildPurchaseOrderActivityItems } from "@/features/inventory/utils/purchase-order-activity";

type PurchaseOrderDetailActivityTabProps = {
  order: PurchaseOrder;
  isActive: boolean;
};

export function PurchaseOrderDetailActivityTab({
  order,
  isActive,
}: PurchaseOrderDetailActivityTabProps) {
  if (!isActive) {
    return null;
  }

  const items = buildPurchaseOrderActivityItems(order);

  if (items.length === 0) {
    return (
      <DetailTabEmptyState
        icon={Activity}
        title="No activity yet"
        description="Status changes and notes for this purchase order will appear here as they happen."
        data-testid="purchase-order-activity-empty-state"
      />
    );
  }

  return (
    <DetailActivityTimeline
      title="Activity"
      description="Recent events recorded for this purchase order."
      items={items}
      data-testid="purchase-order-activity-timeline"
    />
  );
}
