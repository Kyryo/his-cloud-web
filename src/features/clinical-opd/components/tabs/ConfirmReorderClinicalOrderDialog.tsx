"use client";

import { Loader2 } from "lucide-react";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import type { EncounterClinicalOrder } from "@/features/clinical-opd/types/clinical-opd.types";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

type ConfirmReorderClinicalOrderDialogProps = {
  order: EncounterClinicalOrder | null;
  open: boolean;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export function ConfirmReorderClinicalOrderDialog({
  order,
  open,
  isSubmitting,
  onOpenChange,
  onConfirm,
}: ConfirmReorderClinicalOrderDialogProps) {
  if (!order || !open) {
    return null;
  }

  const productLabel = order.description || order.item_type_display || "this product";

  return (
    <div
      className={cn("space-y-3", appFont.className)}
      data-testid="confirm-reorder-clinical-order-dialog"
    >
      <div>
        <h3 className="text-base font-semibold tracking-tight text-brand-navy">
          Add another order?
        </h3>
        <p className="mt-1 text-sm text-brand-slate">
          Do you want to place another {order.item_type_display || "clinical"}{" "}
          order for {productLabel}? This creates a new order line with the same
          clinical and charged quantities.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <SecondaryButton
          type="button"
          disabled={isSubmitting}
          onClick={() => onOpenChange(false)}
          data-testid="confirm-reorder-clinical-order-cancel"
        >
          Cancel
        </SecondaryButton>
        <PrimaryButton
          type="button"
          disabled={isSubmitting}
          onClick={onConfirm}
          data-testid="confirm-reorder-clinical-order-confirm"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Adding…
            </>
          ) : (
            "Add another order"
          )}
        </PrimaryButton>
      </div>
    </div>
  );
}
