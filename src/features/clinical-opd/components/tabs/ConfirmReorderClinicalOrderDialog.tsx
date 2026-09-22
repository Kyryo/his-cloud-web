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
  const productLabel =
    order?.description || order?.item_type_display || "this product";
  const orderType = order?.item_type_display || "clinical";

  return (
    <SectionedDialog
      open={open && Boolean(order)}
      onOpenChange={(nextOpen) => {
        if (!isSubmitting) {
          onOpenChange(nextOpen);
        }
      }}
      title="Add another order?"
      description={`Do you want to place another ${orderType} order for ${productLabel}?`}
      className={cn(appFont.className, "sm:max-w-md")}
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
        This creates a new order line with the same clinical and charged
        quantities.
      </p>
    </SectionedDialog>
  );
}
