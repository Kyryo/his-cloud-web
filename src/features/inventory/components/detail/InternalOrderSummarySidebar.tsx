"use client";

import { useEffect, useState } from "react";

import { EditButton } from "@/components/ui/edit-button";
import { Progress } from "@/components/ui/progress";
import { InternalOrderStatusStepper } from "@/features/inventory/components/detail/InternalOrderStatusStepper";
import { InventorySummaryPanel } from "@/features/inventory/components/InventorySummaryPanel";
import { fetchInventoryLocations } from "@/features/inventory/services/inventory.service";
import type { InternalOrder } from "@/features/inventory/types/inventory.types";
import type { InternalOrderLineDraft } from "@/features/inventory/types/internal-order-line-draft";
import {
  countLinesMissingBatch,
  countSavedInternalLineDrafts,
  draftHasProduct,
} from "@/features/inventory/types/internal-order-line-draft";
import {
  formatDisplayDateTime,
  formatInternalOrderStatusLabel,
} from "@/features/inventory/utils/format-inventory";
import { cn } from "@/lib/utils";

type InternalOrderSummarySidebarProps = {
  order: InternalOrder;
  draftLines?: InternalOrderLineDraft[];
  batchTrackingEnabled?: boolean;
  onEditClick?: () => void;
  className?: string;
};

function calculateOrderCompletionPercent(
  order: InternalOrder,
  draftLines?: InternalOrderLineDraft[],
  batchTrackingEnabled = false,
): number {
  if (order.status === "RECEIVED") {
    return 100;
  }

  const savedDrafts =
    draftLines ??
    order.lines.map((line) => ({
      key: String(line.id ?? line.product_id),
      product_id: line.product_id ?? null,
      product_uuid: line.product_uuid ?? null,
      productName: line.product_name ?? null,
      quantity: String(line.quantity),
      quantityAvailable: line.quantity_available ?? null,
      batch: line.batch ?? null,
    }));

  const savedCount = countSavedInternalLineDrafts(savedDrafts);
  if (savedCount === 0) {
    return 0;
  }

  if (!batchTrackingEnabled) {
    const invalidCount = savedDrafts.filter(
      (line) => draftHasProduct(line) && Number.parseFloat(line.quantity) <= 0,
    ).length;
    return Math.round(((savedCount - invalidCount) / savedCount) * 100);
  }

  const missingBatchCount = countLinesMissingBatch(savedDrafts, {
    batchTrackingEnabled: true,
  });
  return Math.round(((savedCount - missingBatchCount) / savedCount) * 100);
}

export function InternalOrderSummarySidebar({
  order,
  draftLines,
  batchTrackingEnabled = false,
  onEditClick,
  className,
}: InternalOrderSummarySidebarProps) {
  const [locationLabels, setLocationLabels] = useState<Record<number, string>>({});
  const completionPercent = calculateOrderCompletionPercent(
    order,
    draftLines,
    batchTrackingEnabled,
  );
  const showReadiness = order.status === "DRAFT";

  useEffect(() => {
    if (order.source_location_name && order.destination_location_name) {
      return;
    }

    let cancelled = false;

    async function loadLocations() {
      try {
        const response = await fetchInventoryLocations();
        if (cancelled) {
          return;
        }

        const labels = Object.fromEntries(
          response.results.map((location) => [location.id, location.name]),
        );
        setLocationLabels(labels);
      } catch {
        if (!cancelled) {
          setLocationLabels({});
        }
      }
    }

    void loadLocations();

    return () => {
      cancelled = true;
    };
  }, [order.destination_location_name, order.source_location_name]);

  const sourceLabel =
    order.source_location_name?.trim() ||
    locationLabels[order.source_location] ||
    order.source_location;
  const destinationLabel =
    order.destination_location_name?.trim() ||
    locationLabels[order.destination_location] ||
    order.destination_location;

  const editAction = onEditClick ? (
    <EditButton
      label="Edit details"
      onClick={onEditClick}
      data-testid="internal-order-sidebar-update-button"
    />
  ) : null;

  return (
    <div className={cn(className)}>
      <InventorySummaryPanel
        highlight={
          <div className="space-y-4">
            <InternalOrderStatusStepper order={order} />
            {showReadiness ? (
              <div className="space-y-2 border-t border-brand-border pt-4">
                <div className="flex items-center justify-between text-xs text-brand-muted">
                  <span>Order readiness</span>
                  <span className="font-medium text-brand-navy">{completionPercent}%</span>
                </div>
                <Progress value={completionPercent} />
                <p className="text-[11px] text-brand-muted">
                  {batchTrackingEnabled
                    ? "Based on line items with batch recorded."
                    : "Based on valid line items with quantity."}
                </p>
              </div>
            ) : null}
          </div>
        }
        sections={[
          {
            title: "Order summary",
            action: editAction,
            fields: [
              { label: "Reference", value: order.reference_number },
              { label: "Status", value: formatInternalOrderStatusLabel(order.status) },
              { label: "Source", value: sourceLabel },
              { label: "Destination", value: destinationLabel },
              { label: "Approved", value: formatDisplayDateTime(order.approved_at) },
              { label: "Dispatched", value: formatDisplayDateTime(order.dispatched_at) },
              { label: "Received", value: formatDisplayDateTime(order.received_at) },
              { label: "Created", value: formatDisplayDateTime(order.created_at) },
            ],
          },
        ]}
      />
    </div>
  );
}
