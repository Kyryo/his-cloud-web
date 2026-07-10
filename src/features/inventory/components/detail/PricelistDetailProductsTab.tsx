"use client";

import { Loader2, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
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
import { ROUTES } from "@/constants/routes";
import {
  fetchCatalogPricelistProducts,
  removeCatalogPricelistProduct,
  updateCatalogPricelistProduct,
} from "@/features/catalog/services/catalog.service";
import type {
  CatalogPricelist,
  CatalogPricelistMembership,
} from "@/features/catalog/types/catalog.types";
import { AddPricelistProductDialog } from "@/features/inventory/components/detail/AddPricelistProductDialog";
import { CopyPricelistProductsDialog } from "@/features/inventory/components/detail/CopyPricelistProductsDialog";
import { PricelistCopyJobPanel } from "@/features/inventory/components/detail/PricelistCopyJobPanel";
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

type PricelistDetailProductsTabProps = {
  pricelist: CatalogPricelist;
  isActive: boolean;
};

type PendingPriceEdit = {
  item: CatalogPricelistMembership;
  value: string;
};

export function PricelistDetailProductsTab({
  pricelist,
  isActive,
}: PricelistDetailProductsTabProps) {
  const { toast } = useToast();
  const { userData } = useUser();
  const isTenantAdmin = Boolean(userData?.is_admin);
  const [items, setItems] = useState<CatalogPricelistMembership[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [copyOpen, setCopyOpen] = useState(false);
  const [activeCopyJobUuid, setActiveCopyJobUuid] = useState<string | null>(null);
  const [activeCopyToastId, setActiveCopyToastId] = useState<string | number | null>(
    null,
  );
  const [priceEdit, setPriceEdit] = useState<PendingPriceEdit | null>(null);
  const [pendingRemove, setPendingRemove] = useState<CatalogPricelistMembership | null>(
    null,
  );
  const [isSaving, setIsSaving] = useState(false);

  const loadItems = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) {
      setIsLoading(true);
    }
    try {
      setError(null);
      const response = await fetchCatalogPricelistProducts(pricelist.uuid, {
        pageSize: 200,
      });
      setItems(response.results);
    } catch (err) {
      setItems([]);
      setError(err instanceof Error ? err.message : "Failed to load products.");
    } finally {
      if (!options?.silent) {
        setIsLoading(false);
      }
      setHasLoaded(true);
    }
  }, [pricelist.uuid]);

  useEffect(() => {
    if (!isActive) {
      return;
    }
    void loadItems();
  }, [isActive, loadItems]);

  async function handleUpdatePrice() {
    if (!priceEdit?.item.product_uuid) {
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
      const result = await updateCatalogPricelistProduct(
        pricelist.uuid,
        priceEdit.item.product_uuid,
        { fixed_price: parsedPrice },
      );
      toast({
        variant: "success",
        title: result.approval_required
          ? "Price change submitted for approval"
          : "Price updated",
        description: result.approval_required
          ? "A second approver must confirm this change before it takes effect."
          : "The fixed price was saved.",
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
    if (!pendingRemove?.product_uuid) {
      return;
    }

    setIsSaving(true);
    try {
      const result = await removeCatalogPricelistProduct(
        pricelist.uuid,
        pendingRemove.product_uuid,
      );
      toast({
        variant: "success",
        title: result.approval_required
          ? "Removal submitted for approval"
          : "Product removed",
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

  const showInitialLoader = isLoading && !hasLoaded;

  if (showInitialLoader) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl border border-brand-border bg-white px-6 py-16 text-sm text-brand-muted">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        Loading products...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        <p>{error}</p>
        <SecondaryButton type="button" className="mt-4" onClick={() => void loadItems()}>
          Try again
        </SecondaryButton>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="pricelist-products-tab">
      {activeCopyJobUuid ? (
        <PricelistCopyJobPanel
          targetPricelistUuid={pricelist.uuid}
          jobUuid={activeCopyJobUuid}
          copyToastId={activeCopyToastId ?? undefined}
          onTerminal={(job) => {
            void loadItems({ silent: true });
            if (job.status === "completed") {
              setActiveCopyJobUuid(null);
              setActiveCopyToastId(null);
            }
          }}
          onDismiss={() => {
            setActiveCopyJobUuid(null);
            setActiveCopyToastId(null);
          }}
        />
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-brand-navy">Products</h3>
          <p className="mt-0.5 text-xs text-brand-muted">
            Fixed prices for products on this pricelist.
          </p>
        </div>
        {isTenantAdmin ? (
          <div className="flex flex-wrap gap-2">
            <PrimaryButton
              type="button"
              className="rounded-full"
              disabled={Boolean(activeCopyJobUuid)}
              onClick={() => setAddOpen(true)}
            >
              Add product
            </PrimaryButton>
            {items.length === 0 && !activeCopyJobUuid ? (
              <SecondaryButton
                type="button"
                className="rounded-full"
                onClick={() => setCopyOpen(true)}
              >
                Copy from pricelist
              </SecondaryButton>
            ) : null}
          </div>
        ) : null}
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-brand-border bg-white px-6 py-14 text-center">
          <h3 className="text-lg font-semibold text-brand-navy">No products yet</h3>
          <p className="mt-2 text-sm text-brand-muted">
            Add products manually or copy them from another pricelist.
          </p>
          {isTenantAdmin && !activeCopyJobUuid ? (
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <PrimaryButton
                type="button"
                className="rounded-full"
                onClick={() => setAddOpen(true)}
              >
                Add product
              </PrimaryButton>
              <SecondaryButton
                type="button"
                className="rounded-full"
                onClick={() => setCopyOpen(true)}
              >
                Copy from pricelist
              </SecondaryButton>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-brand-border bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50/80 text-left text-xs uppercase tracking-wide text-brand-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Product</th>
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
                  <tr key={item.product_uuid} className="text-brand-navy">
                    <td className="px-4 py-3 font-medium">
                      <Link
                        href={ROUTES.inventoryProductDetail(item.product_uuid)}
                        className="text-brand-primary hover:underline"
                      >
                        {item.product_name ?? item.product_uuid}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right">{item.min_quantity ?? "—"}</td>
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
                            Edit
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

      <AddPricelistProductDialog
        pricelist={pricelist}
        existingProductUuids={items.map((item) => item.product_uuid)}
        open={addOpen}
        onOpenChange={setAddOpen}
        onAdded={() => void loadItems()}
      />

      <CopyPricelistProductsDialog
        targetPricelist={pricelist}
        open={copyOpen}
        onOpenChange={setCopyOpen}
        onCopyStarted={(jobUuid, toastId) => {
          setActiveCopyJobUuid(jobUuid);
          setActiveCopyToastId(toastId);
        }}
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
              Set the fixed price for {priceEdit?.item.product_name ?? "this product"}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="pricelist-edit-fixed-price">Fixed price</Label>
            <Input
              id="pricelist-edit-fixed-price"
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
            <SecondaryButton type="button" disabled={isSaving} onClick={() => setPriceEdit(null)}>
              Cancel
            </SecondaryButton>
            <PrimaryButton type="button" disabled={isSaving} onClick={() => void handleUpdatePrice()}>
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
            <DialogTitle>Remove product?</DialogTitle>
            <DialogDescription>
              Remove {pendingRemove?.product_name ?? "this product"} from {pricelist.name}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <SecondaryButton
              type="button"
              disabled={isSaving}
              onClick={() => setPendingRemove(null)}
            >
              Keep product
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
                "Remove product"
              )}
            </DestructiveButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
