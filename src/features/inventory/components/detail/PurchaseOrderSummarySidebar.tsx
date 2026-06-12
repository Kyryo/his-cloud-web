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
  onEditClick?: () => void;
  className?: string;
};

function calculateOrderCompletionPercent(
  order: PurchaseOrder,
  draftLines?: PurchaseOrderLineDraft[],
): number {
  if (order.status === "CONFIRMED") {
    return 100;
  }

  const lines =
    draftLines ??
    order.lines.map((line) => ({
      odoo_product_id: line.odoo_product_id,
      batch: line.batch ?? null,
      expiry_date: line.expiry_date ?? null,
    }));

  const savedCount = countSavedLineDrafts(
    draftLines ??
      order.lines.map((line) => ({
        key: String(line.id ?? line.odoo_product_id),
        odoo_product_id: line.odoo_product_id,
        productName: null,
        quantity: String(line.quantity),
        unit_cost: String(line.unit_cost),
        batch: line.batch ?? null,
        expiry_date: line.expiry_date ?? null,
      })),
  );

  if (savedCount === 0) {
    return 0;
  }

  const missingBatchCount = countLinesMissingBatchOrExpiry(lines);
  const completeCount = savedCount - missingBatchCount;
  return Math.round((completeCount / savedCount) * 100);
}

export function PurchaseOrderSummarySidebar({
  order,
  draftLines,
  onEditClick,
  className,
}: PurchaseOrderSummarySidebarProps) {
  const completionPercent = calculateOrderCompletionPercent(order, draftLines);
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
                  Based on line items with batch and expiry recorded.
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
