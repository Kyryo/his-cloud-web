"use client";

import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import {
  DestructiveButton,
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
import { AddProductToPricelistDialog } from "@/features/inventory/components/detail/AddProductToPricelistDialog";
import {
  fetchInventoryProductPricelists,
  removeProductFromPricelist,
  updatePricelistProductPrice,
} from "@/features/inventory/services/inventory.service";
import type {
  InventoryProduct,
  InventoryProductPricelistItem,
} from "@/features/inventory/types/inventory.types";
import {
  formatDisplayDate,
  formatInventoryAmount,
} from "@/features/inventory/utils/format-inventory";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";
import { useUser } from "@/providers/user-provider";

type ProductDetailPricelistsTabProps = {
  product: InventoryProduct;
  isActive: boolean;
};

type PendingPriceEdit = {
  item: InventoryProductPricelistItem;
  value: string;
};

type PendingRemove = InventoryProductPricelistItem;

export function ProductDetailPricelistsTab({
  product,
  isActive,
}: ProductDetailPricelistsTabProps) {
  const { toast } = useToast();
  const { userData } = useUser();
  const isTenantAdmin = Boolean(userData?.is_admin);
  const [items, setItems] = useState<InventoryProductPricelistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [priceEdit, setPriceEdit] = useState<PendingPriceEdit | null>(null);
  const [pendingRemove, setPendingRemove] = useState<PendingRemove | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadItems = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const records = await fetchInventoryProductPricelists(product.uuid);
      setItems(records ?? []);
    } catch (err) {
      setItems([]);
      setError(
        err instanceof Error ? err.message : "Failed to load pricelists.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [product.uuid]);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    void loadItems();
  }, [isActive, loadItems]);

  async function handleUpdatePrice() {
    if (!priceEdit?.item.pricelist_uuid) {
      return;
    }

    const parsedPrice = Number(priceEdit.value);
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      toast({
        variant: "error",
        title: "Invalid price",
        description: "Enter a fixed price of zero or greater.",
      });
      return;
    }

    setIsSaving(true);
    try {
      const result = await updatePricelistProductPrice(
        priceEdit.item.pricelist_uuid,
        product.uuid,
        { fixed_price: parsedPrice },
      );

      toast({
        variant: "success",
        title: result.approval_required
          ? "Price change submitted for approval"
          : "Pricelist price updated",
        description: result.approval_required
          ? "A second approver must confirm this change before it takes effect."
          : "The fixed price was saved on the pricelist.",
      });

      setPriceEdit(null);
      await loadItems();
    } catch (err) {
      toast({
        variant: "error",
        title: "Could not update price",
        description:
          err instanceof BffError
            ? formatBffErrorMessage(err.message, err.errors)
            : err instanceof Error
              ? err.message
              : "Something went wrong.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRemove() {
    if (!pendingRemove?.pricelist_uuid) {
      return;
    }

    setIsSaving(true);
    try {
      const result = await removeProductFromPricelist(
        pendingRemove.pricelist_uuid,
        product.uuid,
      );

      toast({
        variant: "success",
        title: result.approval_required
          ? "Removal submitted for approval"
          : "Removed from pricelist",
        description: result.approval_required
          ? "A second approver must confirm this change before it takes effect."
          : "This product was removed from the pricelist.",
      });

      setPendingRemove(null);
      await loadItems();
    } catch (err) {
      toast({
        variant: "error",
        title: "Could not remove product",
        description:
          err instanceof BffError
            ? formatBffErrorMessage(err.message, err.errors)
            : err instanceof Error
              ? err.message
              : "Something went wrong.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  if (!isActive) {
    return null;
  }

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center gap-2 rounded-xl border border-brand-border bg-white px-6 py-16 text-sm text-brand-muted"
        data-testid="product-pricelists-tab"
      >
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        Loading pricelists...
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700"
        data-testid="product-pricelists-tab"
      >
        <p>{error}</p>
        <SecondaryButton
          type="button"
          className="mt-4"
          onClick={() => void loadItems()}
        >
          Try again
        </SecondaryButton>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="product-pricelists-tab">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-brand-navy">Pricelist rules</h3>
          <p className="mt-0.5 text-xs text-brand-muted">
            Product-specific pricing from ERP pricelists.
          </p>
        </div>
        {isTenantAdmin ? (
          <PrimaryButton
            type="button"
            className="rounded-full"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="size-4" aria-hidden="true" />
            Add to pricelist
          </PrimaryButton>
        ) : null}
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-brand-border bg-white px-6 py-14 text-center">
          <h3 className="text-lg font-semibold text-brand-navy">No pricelist rules</h3>
          <p className="mt-2 text-sm text-brand-muted">
            This product is not on any ERP pricelist yet.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-brand-border bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50/80 text-left text-xs uppercase tracking-wide text-brand-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Pricelist</th>
                  <th className="px-4 py-3 text-right font-medium">Min qty</th>
                  <th className="px-4 py-3 text-right font-medium">Fixed price</th>
                  <th className="px-4 py-3 font-medium">Valid from</th>
                  <th className="px-4 py-3 font-medium">Valid to</th>
                  {isTenantAdmin ? (
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  ) : null}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {items.map((item) => (
                  <tr key={item.pricelist_uuid} className="text-brand-navy">
                    <td className="px-4 py-3 font-medium">
                      {item.pricelist_name ?? item.pricelist_uuid}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {item.min_quantity ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {formatInventoryAmount(item.fixed_price)}
                    </td>
                    <td className={cn("px-4 py-3 text-brand-slate")}>
                      {formatDisplayDate(
                        typeof item.date_start === "string" ? item.date_start : null,
                      )}
                    </td>
                    <td className="px-4 py-3 text-brand-slate">
                      {formatDisplayDate(
                        typeof item.date_end === "string" ? item.date_end : null,
                      )}
                    </td>
                    {isTenantAdmin ? (
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <SecondaryButton
                            type="button"
                            size="sm"
                            className="rounded-full"
                            onClick={() =>
                              setPriceEdit({
                                item,
                                value:
                                  item.fixed_price != null
                                    ? String(item.fixed_price)
                                    : "",
                              })
                            }
                          >
                            <Pencil className="size-3.5" aria-hidden="true" />
                            Edit price
                          </SecondaryButton>
                          <SecondaryButton
                            type="button"
                            size="sm"
                            className="rounded-full text-red-600 hover:text-red-700"
                            onClick={() => setPendingRemove(item)}
                          >
                            <Trash2 className="size-3.5" aria-hidden="true" />
                            Remove
                          </SecondaryButton>
                        </div>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AddProductToPricelistDialog
        product={product}
        existingItems={items}
        open={addOpen}
        onOpenChange={setAddOpen}
        onAdded={() => void loadItems()}
      />

      <Dialog
        open={Boolean(priceEdit)}
        onOpenChange={(open) => {
          if (!open && !isSaving) {
            setPriceEdit(null);
          }
        }}
      >
        <DialogContent className={cn("sm:max-w-md", appFont.className)}>
          <DialogHeader>
            <DialogTitle>Update fixed price</DialogTitle>
            <DialogDescription>
              {priceEdit?.item.pricelist_name
                ? `Set the fixed price for this product on ${priceEdit.item.pricelist_name}.`
                : "Set the fixed price for this product on the pricelist."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="edit-fixed-price">Fixed price</Label>
            <Input
              id="edit-fixed-price"
              type="number"
              min="0"
              step="any"
              value={priceEdit?.value ?? ""}
              disabled={isSaving}
              onChange={(event) =>
                setPriceEdit((current) =>
                  current ? { ...current, value: event.target.value } : current,
                )
              }
            />
          </div>
          <DialogFooter>
            <SecondaryButton
              type="button"
              disabled={isSaving}
              onClick={() => setPriceEdit(null)}
            >
              Cancel
            </SecondaryButton>
            <PrimaryButton
              type="button"
              disabled={isSaving}
              onClick={() => void handleUpdatePrice()}
            >
              {isSaving ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Saving...
                </>
              ) : (
                "Save price"
              )}
            </PrimaryButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(pendingRemove)}
        onOpenChange={(open) => {
          if (!open && !isSaving) {
            setPendingRemove(null);
          }
        }}
      >
        <DialogContent className={cn("sm:max-w-md", appFont.className)}>
          <DialogHeader>
            <DialogTitle>Remove from pricelist?</DialogTitle>
            <DialogDescription>
              {pendingRemove?.pricelist_name
                ? `Remove this product from ${pendingRemove.pricelist_name}.`
                : "Remove this product from the pricelist."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <SecondaryButton
              type="button"
              disabled={isSaving}
              onClick={() => setPendingRemove(null)}
            >
              Keep on pricelist
            </SecondaryButton>
            <DestructiveButton
              type="button"
              disabled={isSaving}
              onClick={() => void handleRemove()}
            >
              {isSaving ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Removing...
                </>
              ) : (
                "Remove from pricelist"
              )}
            </DestructiveButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
