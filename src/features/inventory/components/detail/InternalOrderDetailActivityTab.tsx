"use client";

import { Activity } from "lucide-react";

import { DetailActivityTimeline } from "@/components/detail/detail-activity-timeline";
import { DetailTabEmptyState } from "@/components/detail/detail-tab-empty-state";
import type { InternalOrder } from "@/features/inventory/types/inventory.types";
import { buildInternalOrderActivityItems } from "@/features/inventory/utils/internal-order-activity";

type InternalOrderDetailActivityTabProps = {
  order: InternalOrder;
  isActive: boolean;
};

export function InternalOrderDetailActivityTab({
  order,
  isActive,
}: InternalOrderDetailActivityTabProps) {
  if (!isActive) {
    return null;
  }

  const items = buildInternalOrderActivityItems(order);

  if (items.length === 0) {
    return (
      <DetailTabEmptyState
        icon={Activity}
        title="No activity yet"
        description="Status changes and notes for this internal order will appear here as they happen."
        data-testid="internal-order-activity-empty-state"
      />
    );
  }

  return (
    <DetailActivityTimeline
      title="Activity"
      description="Recent events recorded for this internal order."
      items={items}
      data-testid="internal-order-activity-timeline"
    />
  );
}
