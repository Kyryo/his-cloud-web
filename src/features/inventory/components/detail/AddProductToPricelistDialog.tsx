"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addProductToPricelist } from "@/features/inventory/services/inventory.service";
import type {
  InventoryProduct,
  InventoryProductPricelistItem,
} from "@/features/inventory/types/inventory.types";
import { fetchOrganizationPricelists } from "@/features/settings/services/settings.service";
import type { OrganizationPricelist } from "@/features/settings/types/settings.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type AddProductToPricelistDialogProps = {
  product: InventoryProduct;
  existingItems: InventoryProductPricelistItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdded: () => void;
};

export function AddProductToPricelistDialog({
  product,
  existingItems,
  open,
  onOpenChange,
  onAdded,
}: AddProductToPricelistDialogProps) {
  const { toast } = useToast();
  const [pricelists, setPricelists] = useState<OrganizationPricelist[]>([]);
  const [isLoadingPricelists, setIsLoadingPricelists] = useState(false);
  const [pricelistUuid, setPricelistUuid] = useState("");
  const [fixedPrice, setFixedPrice] = useState(
    product.list_price != null ? String(product.list_price) : "",
  );
  const [minQuantity, setMinQuantity] = useState("1");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const usedPricelistUuids = useMemo(
    () =>
      new Set(
        existingItems
          .map((item) => item.pricelist_uuid)
          .filter((uuid): uuid is string => Boolean(uuid)),
      ),
    [existingItems],
  );

  const availablePricelists = useMemo(
    () =>
      pricelists.filter(
        (entry) => entry.is_active && !usedPricelistUuids.has(entry.uuid),
      ),
    [pricelists, usedPricelistUuids],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    setPricelistUuid("");
    setFixedPrice(product.list_price != null ? String(product.list_price) : "");
    setMinQuantity("1");

    let cancelled = false;

    void (async () => {
      setIsLoadingPricelists(true);
      try {
        const response = await fetchOrganizationPricelists();
        if (!cancelled) {
          setPricelists(response.results ?? []);
        }
      } catch {
        if (!cancelled) {
          toast({
            variant: "error",
            title: "Could not load pricelists",
            description: "Try again or contact your administrator.",
          });
        }
      } finally {
        if (!cancelled) {
          setIsLoadingPricelists(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, product.list_price, toast]);

  async function handleSubmit() {
    const parsedPrice = Number(fixedPrice);
    const parsedMinQty = Number(minQuantity);

    if (!pricelistUuid) {
      toast({
        variant: "error",
        title: "Select a pricelist",
        description: "Choose which pricelist should include this product.",
      });
      return;
    }

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
      const result = await addProductToPricelist(pricelistUuid, {
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
          : "Product added to pricelist",
        description: result.approval_required
          ? "A second approver must confirm this pricelist change before it takes effect."
          : "The product is now available on the selected pricelist.",
      });

      onAdded();
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not add product to pricelist",
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
          <DialogTitle>Add to pricelist</DialogTitle>
          <DialogDescription>
            Set a fixed price for {product.display_name || product.name} on an ERP
            pricelist.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="pricelist-select">Pricelist</Label>
            {isLoadingPricelists ? (
              <div className="flex items-center gap-2 text-sm text-brand-muted">
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Loading pricelists...
              </div>
            ) : availablePricelists.length === 0 ? (
              <p className="text-sm text-brand-muted">
                This product is already on every active pricelist.
              </p>
            ) : (
              <Select
                value={pricelistUuid}
                onValueChange={setPricelistUuid}
                disabled={isSubmitting}
              >
                <SelectTrigger id="pricelist-select">
                  <SelectValue placeholder="Select a pricelist" />
                </SelectTrigger>
                <SelectContent>
                  {availablePricelists.map((entry) => (
                    <SelectItem key={entry.uuid} value={entry.uuid}>
                      {entry.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pricelist-fixed-price">Fixed price</Label>
            <Input
              id="pricelist-fixed-price"
              type="number"
              min="0"
              step="any"
              value={fixedPrice}
              disabled={isSubmitting}
              onChange={(event) => setFixedPrice(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pricelist-min-qty">Minimum quantity</Label>
            <Input
              id="pricelist-min-qty"
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
          <PrimaryButton
            type="button"
            disabled={
              isSubmitting ||
              isLoadingPricelists ||
              availablePricelists.length === 0
            }
            onClick={() => void handleSubmit()}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Saving...
              </>
            ) : (
              "Add to pricelist"
            )}
          </PrimaryButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
