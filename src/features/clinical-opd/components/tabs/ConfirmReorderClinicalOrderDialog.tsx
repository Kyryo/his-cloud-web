"use client";

import { Loader2 } from "lucide-react";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { SectionedDialog } from "@/components/ui/sectioned-dialog";
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
  if (!order) {
    return null;
  }

  const productLabel = order.description || order.item_type_display || "this product";

  return (
    <SectionedDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add another order?"
      description={`Do you want to place another ${order.item_type_display || "clinical"} order for ${productLabel}?`}
      className={cn("sm:max-w-md", appFont.className)}
      data-testid="confirm-reorder-clinical-order-dialog"
      footer={
        <>
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
        </>
      }
    >
      <p className="text-sm text-brand-slate">
        This will create a new order line with the same clinical and charged
        quantities as the existing order.
      </p>
    </SectionedDialog>
  );
}
