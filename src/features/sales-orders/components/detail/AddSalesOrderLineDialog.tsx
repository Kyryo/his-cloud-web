"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import {
  PrimaryButton,
  SecondaryButton,
} from "@/components/ui/app-buttons";
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
import { ProductSearchCombobox } from "@/features/inventory/components/ProductSearchCombobox";
import type { InventoryProduct } from "@/features/inventory/types/inventory.types";
import { addSalesOrderLine } from "@/features/sales-orders/services/sales-orders.service";
import type { SalesOrder } from "@/features/sales-orders/types/sales-order.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type AddSalesOrderLineDialogProps = {
  order: SalesOrder;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdded: (order: SalesOrder) => void;
};

export function AddSalesOrderLineDialog({
  order,
  open,
  onOpenChange,
  onAdded,
}: AddSalesOrderLineDialogProps) {
  const { toast } = useToast();
  const [selectedProduct, setSelectedProduct] = useState<InventoryProduct | null>(
    null,
  );
  const [quantity, setQuantity] = useState("1");
  const [priceUnit, setPriceUnit] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setSelectedProduct(null);
    setQuantity("1");
    setPriceUnit("");
  }, [open]);

  function handleProductSelect(product: InventoryProduct) {
    setSelectedProduct(product);
    if (product.list_price != null && product.list_price !== "") {
      setPriceUnit(String(product.list_price));
    }
  }

  async function handleSubmit() {
    if (!selectedProduct) {
      toast({
        variant: "error",
        title: "Select a product",
        description: "Choose a product to add to this sales order.",
      });
      return;
    }

    const parsedQuantity = Number(quantity);
    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      toast({
        variant: "error",
        title: "Invalid quantity",
        description: "Quantity must be greater than zero.",
      });
      return;
    }

    const payload: {
      product_id: number;
      quantity: string;
      price_unit?: string;
    } = {
      product_id: selectedProduct.id,
      quantity: parsedQuantity.toFixed(4),
    };

    if (priceUnit.trim()) {
      const parsedPrice = Number(priceUnit);
      if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
        toast({
          variant: "error",
          title: "Invalid unit price",
          description: "Enter a unit price of zero or greater.",
        });
        return;
      }
      payload.price_unit = parsedPrice.toFixed(4);
    }

    setIsSubmitting(true);
    try {
      const updatedOrder = await addSalesOrderLine(order.id, payload);
      toast({
        variant: "success",
        title: "Line item added",
        description: "The sales order was updated with the new line item.",
      });
      onAdded(updatedOrder);
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not add line item",
        description:
          error instanceof BffError
            ? formatBffErrorMessage(error.message, error.errors)
            : error instanceof Error
              ? error.message
              : "Something went wrong.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-md", appFont.className)}>
        <DialogHeader>
          <DialogTitle>Add line item</DialogTitle>
          <DialogDescription>
            Add a product line to sales order {order.name}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <ProductSearchCombobox
            id="sales-order-line-product"
            label="Product"
            value={selectedProduct?.id ?? null}
            onSelect={handleProductSelect}
            disabled={isSubmitting}
          />

          <div className="space-y-2">
            <Label htmlFor="sales-order-line-qty">Quantity</Label>
            <Input
              id="sales-order-line-qty"
              type="number"
              min="0"
              step="any"
              value={quantity}
              disabled={isSubmitting}
              onChange={(event) => setQuantity(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sales-order-line-price">Unit price (optional)</Label>
            <Input
              id="sales-order-line-price"
              type="number"
              min="0"
              step="any"
              value={priceUnit}
              disabled={isSubmitting}
              placeholder="Uses pricelist default when empty"
              onChange={(event) => setPriceUnit(event.target.value)}
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
            disabled={isSubmitting}
            onClick={() => void handleSubmit()}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Adding...
              </>
            ) : (
              "Add line item"
            )}
          </PrimaryButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
