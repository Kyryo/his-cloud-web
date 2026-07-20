"use client";

import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateSalesOrderLine } from "@/features/sales-orders/services/sales-orders.service";
import type { SalesOrderLine } from "@/features/sales-orders/types/sales-order.types";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type EditQueueLineDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  salesOrderId: number;
  line: SalesOrderLine | null;
  onSaved: () => void;
};

export function EditQueueLineDialog({
  open,
  onOpenChange,
  salesOrderId,
  line,
  onSaved,
}: EditQueueLineDialogProps) {
  const { toast } = useToast();
  const [quantity, setQuantity] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open || !line) {
      return;
    }
    setQuantity(String(line.quantity ?? ""));
  }, [line, open]);

  const handleSubmit = useCallback(async () => {
    if (!line) {
      return;
    }

    const nextQuantity = Number(quantity);
    if (!(nextQuantity > 0)) {
      toast({
        title: "Invalid quantity",
        description: "Enter a quantity greater than zero.",
        variant: "error",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await updateSalesOrderLine(salesOrderId, line.id, {
        quantity,
      });
      toast({
        title: "Line updated",
        description: `${line.product_name || line.name} was updated.`,
        variant: "success",
      });
      onOpenChange(false);
      onSaved();
    } catch (error) {
      toast({
        title: "Could not update line",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [line, onOpenChange, onSaved, quantity, salesOrderId, toast]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("max-w-md", appFont.className)}>
        <DialogHeader>
          <DialogTitle>Edit line item</DialogTitle>
          <DialogDescription>
            Update the ordered quantity for this sales order line.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-xl border border-brand-border bg-slate-50/70 px-4 py-3">
            <p className="text-sm font-medium text-brand-navy">
              {line?.product_name || line?.name || "Line item"}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="queue-line-quantity">Quantity</Label>
            <Input
              id="queue-line-quantity"
              type="number"
              step="any"
              min="0"
              value={quantity}
              disabled={isSubmitting}
              onChange={(event) => setQuantity(event.target.value)}
            />
          </div>
        </div>

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
            disabled={isSubmitting || !line}
            onClick={() => void handleSubmit()}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Saving...
              </>
            ) : (
              "Save changes"
            )}
          </PrimaryButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
