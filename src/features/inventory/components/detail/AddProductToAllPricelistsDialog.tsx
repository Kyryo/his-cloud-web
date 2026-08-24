"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { SectionedDialog } from "@/components/ui/sectioned-dialog";
import { StatusBanner } from "@/components/ui/status-banner";
import type { AddProductToAllPricelistsPriceSource } from "@/features/inventory/types/inventory.types";
import { formatInventoryAmount } from "@/features/inventory/utils/format-inventory";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

type AddProductToAllPricelistsDialogProps = {
  open: boolean;
  listPrice?: string | number | null;
  remainingCount?: number | null;
  isSaving?: boolean;
  error?: string | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (
    priceSource: AddProductToAllPricelistsPriceSource,
  ) => void | Promise<void>;
};

export function AddProductToAllPricelistsDialog({
  open,
  listPrice,
  remainingCount = null,
  isSaving = false,
  error = null,
  onOpenChange,
  onConfirm,
}: AddProductToAllPricelistsDialogProps) {
  const [priceSource, setPriceSource] =
    useState<AddProductToAllPricelistsPriceSource>("list_price");

  useEffect(() => {
    if (!open) {
      return;
    }
    setPriceSource("list_price");
  }, [open]);

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && isSaving) {
      return;
    }
    onOpenChange(nextOpen);
  }

  const formattedListPrice = formatInventoryAmount(listPrice);
  const remainingLabel =
    remainingCount != null && remainingCount > 0
      ? ` It will be added to ${remainingCount} remaining active pricelist${
          remainingCount === 1 ? "" : "s"
        }.`
      : "";

  return (
    <SectionedDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Add to all pricelists"
      description={`This will add the product to every active pricelist it is not already on. Existing memberships stay unchanged.${remainingLabel}`}
      className={cn("sm:max-w-md", appFont.className)}
      data-testid="add-product-to-all-pricelists-dialog"
      footer={
        <>
          <SecondaryButton
            type="button"
            size="sm"
            className="px-4"
            disabled={isSaving}
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </SecondaryButton>
          <PrimaryButton
            type="button"
            size="sm"
            className="px-4"
            disabled={isSaving}
            data-testid="add-to-all-pricelists-confirm"
            onClick={() => void onConfirm(priceSource)}
          >
            {isSaving ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Adding…
              </>
            ) : (
              "Add to all pricelists"
            )}
          </PrimaryButton>
        </>
      }
    >
      <fieldset className="space-y-3" disabled={isSaving}>
        <legend className="mb-1 text-xs font-medium uppercase tracking-wide text-brand-muted">
          Price source
        </legend>
        <div role="radiogroup" className="space-y-2" aria-label="Price source">
          <label
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-3 transition-colors",
              priceSource === "list_price"
                ? "border-brand-primary bg-brand-tint/40"
                : "border-brand-border hover:bg-slate-50",
            )}
          >
            <input
              type="radio"
              name="add-product-to-all-pricelists-source"
              className="mt-0.5 shrink-0"
              checked={priceSource === "list_price"}
              onChange={() => setPriceSource("list_price")}
              data-testid="add-to-all-pricelists-source-list-price"
            />
            <span className="min-w-0">
              <span className="block text-sm font-medium text-brand-navy">
                Use list price
              </span>
              <span className="mt-0.5 block text-sm text-brand-muted">
                {listPrice != null && listPrice !== ""
                  ? `Add the product at its current list price (${formattedListPrice}).`
                  : "Add the product at its current list price."}
              </span>
            </span>
          </label>

          <label
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-3 transition-colors",
              priceSource === "zero"
                ? "border-brand-primary bg-brand-tint/40"
                : "border-brand-border hover:bg-slate-50",
            )}
          >
            <input
              type="radio"
              name="add-product-to-all-pricelists-source"
              className="mt-0.5 shrink-0"
              checked={priceSource === "zero"}
              onChange={() => setPriceSource("zero")}
              data-testid="add-to-all-pricelists-source-zero"
            />
            <span className="min-w-0">
              <span className="block text-sm font-medium text-brand-navy">
                Use 0
              </span>
              <span className="mt-0.5 block text-sm text-brand-muted">
                Add the product with a fixed price of 0.
              </span>
            </span>
          </label>
        </div>
      </fieldset>

      {error ? (
        <div className="mt-4">
          <StatusBanner variant="error" message={error} />
        </div>
      ) : null}
    </SectionedDialog>
  );
}
