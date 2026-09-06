"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { SectionedDialog } from "@/components/ui/sectioned-dialog";
import { updateInventoryProduct } from "@/features/inventory/services/inventory.service";
import type { InventoryProduct } from "@/features/inventory/types/inventory.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type AvailabilityDraft = {
  sale_ok: boolean;
  purchase_ok: boolean;
};

type EditProductAvailabilityDialogProps = {
  product: InventoryProduct;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: (product: InventoryProduct) => void;
};

function draftFromProduct(product: InventoryProduct): AvailabilityDraft {
  const isService = product.product_type === "service";
  return {
    sale_ok: product.sale_ok ?? true,
    purchase_ok: isService ? false : (product.purchase_ok ?? true),
  };
}

export function EditProductAvailabilityDialog({
  product,
  open,
  onOpenChange,
  onUpdated,
}: EditProductAvailabilityDialogProps) {
  const { toast } = useToast();
  const [draft, setDraft] = useState<AvailabilityDraft>(() =>
    draftFromProduct(product),
  );
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const isService = product.product_type === "service";

  useEffect(() => {
    if (!open) {
      return;
    }
    setDraft(draftFromProduct(product));
    setFieldError(null);
  }, [open, product]);

  const handleSave = async () => {
    setFieldError(null);

    if (isService && draft.purchase_ok) {
      setFieldError("Service products cannot be purchased.");
      return;
    }

    try {
      setIsSaving(true);
      const updated = await updateInventoryProduct(product.uuid, {
        sale_ok: draft.sale_ok,
        purchase_ok: isService ? false : draft.purchase_ok,
      });
      onUpdated(updated);
      onOpenChange(false);
      toast({
        title: "Availability saved",
        description: "Product availability flags were updated.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Could not save availability",
        description:
          error instanceof BffError
            ? formatBffErrorMessage(error.message, error.errors)
            : error instanceof Error
              ? error.message
              : "Unable to update availability flags.",
        variant: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SectionedDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit availability"
      description="Control whether this product can be sold or purchased."
      className={appFont.className}
      data-testid="edit-product-availability-dialog"
      footer={
        <>
          <SecondaryButton
            type="button"
            disabled={isSaving}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </SecondaryButton>
          <PrimaryButton
            type="button"
            disabled={isSaving}
            onClick={() => void handleSave()}
            data-testid="edit-product-availability-save"
          >
            {isSaving ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Saving…
              </>
            ) : (
              "Save"
            )}
          </PrimaryButton>
        </>
      }
    >
      <div className="space-y-3">
        <label
          className={cn(
            "flex cursor-pointer items-start justify-between gap-3 rounded-xl border px-4 py-3",
            draft.sale_ok
              ? "border-brand-primary bg-brand-primary/5"
              : "border-brand-border bg-white",
          )}
        >
          <span>
            <span className="block text-sm font-medium text-brand-navy">
              Can be sold
            </span>
            <span className="mt-0.5 block text-xs text-brand-muted">
              Allow this product on sales orders and invoices.
            </span>
          </span>
          <input
            type="checkbox"
            className="mt-0.5 size-4 rounded border-brand-border"
            checked={draft.sale_ok}
            disabled={isSaving}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                sale_ok: event.target.checked,
              }))
            }
            data-testid="availability-sale-ok"
          />
        </label>

        <label
          className={cn(
            "flex items-start justify-between gap-3 rounded-xl border px-4 py-3",
            isService
              ? "cursor-not-allowed border-brand-border bg-dash-canvas/40 opacity-70"
              : draft.purchase_ok
                ? "cursor-pointer border-brand-primary bg-brand-primary/5"
                : "cursor-pointer border-brand-border bg-white",
          )}
        >
          <span>
            <span className="block text-sm font-medium text-brand-navy">
              Can be purchased
            </span>
            <span className="mt-0.5 block text-xs text-brand-muted">
              {isService
                ? "Service products cannot be purchased."
                : "Allow this product on purchase orders and receipts."}
            </span>
          </span>
          <input
            type="checkbox"
            className="mt-0.5 size-4 rounded border-brand-border"
            checked={draft.purchase_ok}
            disabled={isSaving || isService}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                purchase_ok: event.target.checked,
              }))
            }
            data-testid="availability-purchase-ok"
          />
        </label>

        {fieldError ? (
          <p className="text-xs text-destructive" data-testid="availability-error">
            {fieldError}
          </p>
        ) : null}
      </div>
    </SectionedDialog>
  );
}
