"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  createEmptyLineItem,
  InventoryLineItemsEditor,
  type InventoryLineItemDraft,
} from "@/features/inventory/components/forms/InventoryLineItemsEditor";
import { updatePurchaseOrder } from "@/features/inventory/services/purchase-orders.service";
import type { PurchaseOrder } from "@/features/inventory/types/inventory.types";
import {
  draftsToPurchaseOrderLines,
  purchaseOrderLinesToDrafts,
} from "@/features/inventory/utils/purchase-order-lines";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type EditPurchaseOrderLinesDialogProps = {
  order: PurchaseOrder;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: (order: PurchaseOrder) => void;
};

export function EditPurchaseOrderLinesDialog({
  order,
  open,
  onOpenChange,
  onUpdated,
}: EditPurchaseOrderLinesDialogProps) {
  const { toast } = useToast();
  const [lines, setLines] = useState<InventoryLineItemDraft[]>([
    createEmptyLineItem(),
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setLines(purchaseOrderLinesToDrafts(order.lines));
    }
  }, [open, order.lines]);

  async function handleSave() {
    const validLines = draftsToPurchaseOrderLines(lines);

    if (validLines.length === 0) {
      toast({
        title: "Line items required",
        description: "Add at least one product to this purchase order.",
        variant: "error",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await updatePurchaseOrder(order.uuid, { lines: validLines });
      toast({
        title: "Line items saved",
        description: `${updated.reference_number} now has ${updated.lines.length} line item${updated.lines.length === 1 ? "" : "s"}.`,
        variant: "success",
      });
      onUpdated(updated);
      onOpenChange(false);
    } catch (err) {
      toast({
        title: "Could not save line items",
        description: err instanceof Error ? err.message : "Something went wrong.",
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn("max-w-3xl", appFont.className)}
        data-testid="edit-purchase-order-lines-dialog"
      >
        <DialogHeader>
          <DialogTitle>Line items</DialogTitle>
          <DialogDescription>
            Add products, quantities, and unit costs for {order.reference_number}.
          </DialogDescription>
        </DialogHeader>

        <InventoryLineItemsEditor lines={lines} onChange={setLines} />

        <DialogFooter>
          <SecondaryButton
            type="button"
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </SecondaryButton>
          <PrimaryButton
            type="button"
            disabled={isSubmitting}
            onClick={() => void handleSave()}
            data-testid="edit-purchase-order-lines-submit"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Saving...
              </>
            ) : (
              "Save line items"
            )}
          </PrimaryButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
