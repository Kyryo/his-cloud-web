"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { SectionedDialog } from "@/components/ui/sectioned-dialog";
import { StatusBanner } from "@/components/ui/status-banner";
import type { RecalculateSalesOrderPricesSource } from "@/features/sales-orders/types/sales-order.types";
import { formatSalesOrderPricelist } from "@/features/sales-orders/utils/format-sales-order";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

type RecalculateSalesOrderPricesDialogProps = {
  open: boolean;
  pricelistName: string | null;
  isSaving?: boolean;
  error?: string | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (source: RecalculateSalesOrderPricesSource) => void | Promise<void>;
};

export function RecalculateSalesOrderPricesDialog({
  open,
  pricelistName,
  isSaving = false,
  error = null,
  onOpenChange,
  onConfirm,
}: RecalculateSalesOrderPricesDialogProps) {
  const hasPricelist = Boolean(pricelistName?.trim());
  const [source, setSource] = useState<RecalculateSalesOrderPricesSource>(
    hasPricelist ? "pricelist" : "list_price",
  );

  useEffect(() => {
    if (!open) {
      return;
    }
    setSource(hasPricelist ? "pricelist" : "list_price");
  }, [open, hasPricelist]);

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && isSaving) {
      return;
    }
    onOpenChange(nextOpen);
  }

  const pricelistLabel = formatSalesOrderPricelist({
    pricelist_name: pricelistName,
  });

  return (
    <SectionedDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Recalculate prices"
      description="Only line prices will change. The pricelist and scheme on this order stay the same."
      className={cn("sm:max-w-md", appFont.className)}
      data-testid="recalculate-sales-order-prices-dialog"
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
            disabled={isSaving || (source === "pricelist" && !hasPricelist)}
            data-testid="recalculate-sales-order-prices-confirm"
            onClick={() => void onConfirm(source)}
          >
            {isSaving ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Recalculating…
              </>
            ) : (
              "Recalculate"
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
              source === "pricelist"
                ? "border-brand-primary bg-brand-tint/40"
                : "border-brand-border hover:bg-slate-50",
              !hasPricelist && "cursor-not-allowed opacity-50 hover:bg-transparent",
            )}
          >
            <input
              type="radio"
              name="recalculate-sales-order-prices-source"
              className="mt-0.5 shrink-0"
              checked={source === "pricelist"}
              disabled={!hasPricelist}
              onChange={() => setSource("pricelist")}
              data-testid="recalculate-prices-source-pricelist"
            />
            <span className="min-w-0">
              <span className="block text-sm font-medium text-brand-navy">
                Use current pricelist
              </span>
              <span className="mt-0.5 block text-sm text-brand-muted">
                {hasPricelist
                  ? `Apply current prices from ${pricelistLabel}.`
                  : "This order has no pricelist."}
              </span>
            </span>
          </label>

          <label
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-3 transition-colors",
              source === "list_price"
                ? "border-brand-primary bg-brand-tint/40"
                : "border-brand-border hover:bg-slate-50",
            )}
          >
            <input
              type="radio"
              name="recalculate-sales-order-prices-source"
              className="mt-0.5 shrink-0"
              checked={source === "list_price"}
              onChange={() => setSource("list_price")}
              data-testid="recalculate-prices-source-list-price"
            />
            <span className="min-w-0">
              <span className="block text-sm font-medium text-brand-navy">
                Use list price
              </span>
              <span className="mt-0.5 block text-sm text-brand-muted">
                Charge each line at the product list price. The full amount goes
                to the payer.
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
