"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";

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
import { addCatalogPricelistProduct } from "@/features/catalog/services/catalog.service";
import type { CatalogPricelist } from "@/features/catalog/types/catalog.types";
import { InlineProductCombobox } from "@/features/inventory/components/detail/InlineProductCombobox";
import type { InventoryProduct } from "@/features/inventory/types/inventory.types";
import { formatProductLabel } from "@/features/inventory/utils/format-inventory";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type AddPricelistProductDialogProps = {
  pricelist: CatalogPricelist;
  existingProductUuids: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdded: () => void;
};

export function AddPricelistProductDialog({
  pricelist,
  existingProductUuids,
  open,
  onOpenChange,
  onAdded,
}: AddPricelistProductDialogProps) {
  const { toast } = useToast();
  const [product, setProduct] = useState<InventoryProduct | null>(null);
  const [fixedPrice, setFixedPrice] = useState("");
  const [minQuantity, setMinQuantity] = useState("1");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function resetForm() {
    setProduct(null);
    setFixedPrice("");
    setMinQuantity("1");
  }

  async function handleSubmit() {
    if (!product) {
      toast({
        variant: "error",
        title: "Select a product",
        description: "Choose which product to add to this pricelist.",
      });
      return;
    }

    if (existingProductUuids.includes(product.uuid)) {
      toast({
        variant: "error",
        title: "Product already listed",
        description: "This product is already on the pricelist.",
      });
      return;
    }

    const parsedPrice = Number(fixedPrice);
    const parsedMinQty = Number(minQuantity);

    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      toast({
        variant: "error",
        title: "Invalid price",
        description: "Enter a fixed price of zero or greater.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await addCatalogPricelistProduct(pricelist.uuid, {
        product_uuid: product.uuid,
        fixed_price: parsedPrice,
        ...(Number.isFinite(parsedMinQty) && parsedMinQty > 0
          ? { min_quantity: parsedMinQty }
          : {}),
      });

      toast({
        variant: "success",
        title: result.approval_required
          ? "Price change submitted for approval"
          : "Product added",
        description: result.approval_required
          ? "A second approver must confirm this change before it takes effect."
          : "The product was added to the pricelist.",
      });

      resetForm();
      onAdded();
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not add product",
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
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          resetForm();
        }
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className={cn("sm:max-w-md", appFont.className)}>
        <DialogHeader>
          <DialogTitle>Add product to pricelist</DialogTitle>
          <DialogDescription>
            Add a fixed price for a product on {pricelist.name}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="pricelist-add-product">Product</Label>
            <InlineProductCombobox
              id="pricelist-add-product"
              value={product?.uuid ?? null}
              displayLabel={product ? formatProductLabel(product) : null}
              disabled={isSubmitting}
              onSelect={(selected) => {
                setProduct(selected);
                setFixedPrice(
                  selected.list_price != null ? String(selected.list_price) : "",
                );
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pricelist-add-fixed-price">Fixed price</Label>
            <Input
              id="pricelist-add-fixed-price"
              type="number"
              min="0"
              step="any"
              value={fixedPrice}
              disabled={isSubmitting}
              onChange={(event) => setFixedPrice(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pricelist-add-min-qty">Minimum quantity</Label>
            <Input
              id="pricelist-add-min-qty"
              type="number"
              min="0"
              step="any"
              value={minQuantity}
              disabled={isSubmitting}
              onChange={(event) => setMinQuantity(event.target.value)}
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
          <PrimaryButton type="button" disabled={isSubmitting} onClick={() => void handleSubmit()}>
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Saving...
              </>
            ) : (
              "Add product"
            )}
          </PrimaryButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
