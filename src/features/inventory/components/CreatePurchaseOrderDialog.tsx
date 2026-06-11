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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InventoryLocationSelect } from "@/features/inventory/components/InventoryLocationSelect";
import {
  createPurchaseOrder,
  type PurchaseOrderPayload,
} from "@/features/inventory/services/purchase-orders.service";
import type { PurchaseOrder } from "@/features/inventory/types/inventory.types";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type CreatePurchaseOrderDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (order: PurchaseOrder) => void;
};

export function CreatePurchaseOrderDialog({
  open,
  onOpenChange,
  onCreated,
}: CreatePurchaseOrderDialogProps) {
  const { toast } = useToast();
  const [vendorName, setVendorName] = useState("");
  const [receivingLocation, setReceivingLocation] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function resetForm() {
    setVendorName("");
    setReceivingLocation("");
  }

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  async function handleCreate() {
    if (!vendorName.trim()) {
      toast({
        title: "Vendor required",
        description: "Enter the supplier name before creating the order.",
        variant: "error",
      });
      return;
    }

    if (!receivingLocation) {
      toast({
        title: "Location required",
        description: "Choose where stock will be received.",
        variant: "error",
      });
      return;
    }

    const payload: PurchaseOrderPayload = {
      vendor_name: vendorName.trim(),
      receiving_location: Number(receivingLocation),
      lines: [],
    };

    setIsSubmitting(true);
    try {
      const order = await createPurchaseOrder(payload);
      toast({
        title: "Purchase order created",
        description: `${order.reference_number} is ready for line items.`,
        variant: "success",
      });
      resetForm();
      onOpenChange(false);
      onCreated(order);
    } catch (err) {
      toast({
        title: "Could not create purchase order",
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
        className={cn("max-w-lg", appFont.className)}
        data-testid="create-purchase-order-dialog"
      >
        <DialogHeader>
          <DialogTitle>New purchase order</DialogTitle>
          <DialogDescription>
            Choose the vendor and receiving location first. You can add line items
            on the next screen.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="po-vendor">Vendor name</Label>
            <Input
              id="po-vendor"
              value={vendorName}
              onChange={(event) => setVendorName(event.target.value)}
              placeholder="Supplier name"
            />
          </div>
          <InventoryLocationSelect
            id="po-receiving-location"
            label="Receiving location"
            value={receivingLocation}
            onValueChange={(locationId) => setReceivingLocation(String(locationId))}
          />
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
            disabled={isSubmitting}
            onClick={() => void handleCreate()}
            data-testid="create-purchase-order-submit"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Creating...
              </>
            ) : (
              "Create purchase order"
            )}
          </PrimaryButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
