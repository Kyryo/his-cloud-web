"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PurchaseOrderStatusStepper } from "@/features/inventory/components/detail/PurchaseOrderStatusStepper";
import { InventorySummaryPanel } from "@/features/inventory/components/InventorySummaryPanel";
import type { PurchaseOrder } from "@/features/inventory/types/inventory.types";
import type { PurchaseOrderLineDraft } from "@/features/inventory/types/purchase-order-line-draft";
import {
  countLinesMissingBatchOrExpiry,
  countSavedLineDrafts,
} from "@/features/inventory/types/purchase-order-line-draft";
import {
  formatDisplayDate,
  formatDisplayDateTime,
  formatPurchaseStatusLabel,
} from "@/features/inventory/utils/format-inventory";
import { cn } from "@/lib/utils";

type PurchaseOrderSummarySidebarProps = {
  order: PurchaseOrder;
  draftLines?: PurchaseOrderLineDraft[];
  batchTrackingEnabled?: boolean;
  onEditClick?: () => void;
  className?: string;
};

function calculateOrderCompletionPercent(
  order: PurchaseOrder,
  draftLines?: PurchaseOrderLineDraft[],
  batchTrackingEnabled = false,
): number {
  if (order.status === "CONFIRMED") {
    return 100;
  }

  const savedDrafts =
    draftLines ??
    order.lines.map((line) => ({
      key: String(line.id ?? line.product_id),
      product_id: line.product_id,
      productName: null,
      quantity: String(line.quantity),
      unit_cost: String(line.unit_cost),
      batch: line.batch ?? null,
      expiry_date: line.expiry_date ?? null,
    }));

  const savedCount = countSavedLineDrafts(savedDrafts);

  if (savedCount === 0) {
    return 0;
  }

  if (!batchTrackingEnabled) {
    const invalidCount = savedDrafts.filter(
      (line) =>
        line.product_id &&
        (Number.parseFloat(line.quantity) <= 0 || Number.parseFloat(line.unit_cost) <= 0),
    ).length;
    return Math.round(((savedCount - invalidCount) / savedCount) * 100);
  }

  const missingBatchCount = countLinesMissingBatchOrExpiry(savedDrafts, {
    batchTrackingEnabled: true,
  });
  const completeCount = savedCount - missingBatchCount;
  return Math.round((completeCount / savedCount) * 100);
}

export function PurchaseOrderSummarySidebar({
  order,
  draftLines,
  batchTrackingEnabled = false,
  onEditClick,
  className,
}: PurchaseOrderSummarySidebarProps) {
  const completionPercent = calculateOrderCompletionPercent(
    order,
    draftLines,
    batchTrackingEnabled,
  );
  const showReadiness = order.status === "DRAFT";

  const editAction =
    onEditClick ? (
      <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-brand-primary hover:text-brand-navy"
              onClick={onEditClick}
              data-testid="purchase-order-sidebar-update-button"
            >
              Edit details
      </Button>
    ) : null;

  return (
    <div className={cn(className)}>
      <InventorySummaryPanel
        highlight={
          <div className="space-y-4">
            <PurchaseOrderStatusStepper order={order} />
            {showReadiness ? (
              <div className="space-y-2 border-t border-brand-border pt-4">
                <div className="flex items-center justify-between text-xs text-brand-muted">
                  <span>Order readiness</span>
                  <span className="font-medium text-brand-navy">{completionPercent}%</span>
                </div>
                <Progress value={completionPercent} />
                <p className="text-[11px] text-brand-muted">
                  {batchTrackingEnabled
                    ? "Based on line items with batch and expiry recorded."
                    : "Based on valid line items with quantity and unit cost."}
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
              { label: "Vendor", value: order.vendor_name },
              { label: "Status", value: formatPurchaseStatusLabel(order.status) },
              { label: "Delivery date", value: formatDisplayDate(order.delivery_date) },
              { label: "LPO number", value: order.lpo_number?.trim() || "—" },
              {
                label: "GRN number",
                value: order.grn_number?.trim() ? (
                  order.grn_number
                ) : (
                  <span className="font-normal italic text-brand-muted">Not yet recorded</span>
                ),
              },
              { label: "Created", value: formatDisplayDateTime(order.created_at) },
            ],
          },
        ]}
      />
    </div>
  );
}
