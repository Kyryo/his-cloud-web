"use client";

import { Loader2 } from "lucide-react";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { SectionedDialog } from "@/components/ui/sectioned-dialog";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

type DentalNoTeethSelectedDialogProps = {
  open: boolean;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

/** Confirms saving a treatment that has no teeth selected on the odontogram. */
export function DentalNoTeethSelectedDialog({
  open,
  isSubmitting,
  onOpenChange,
  onConfirm,
}: DentalNoTeethSelectedDialogProps) {
  return (
    <SectionedDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isSubmitting) {
          onOpenChange(nextOpen);
        }
      }}
      title="No teeth details selected"
      description="No teeth were selected on the odontogram for this treatment."
      className={cn(appFont.className, "sm:max-w-md")}
      data-testid="dental-no-teeth-dialog"
      footer={
        <>
          <SecondaryButton
            type="button"
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
            data-testid="dental-no-teeth-cancel"
          >
            Select teeth
          </SecondaryButton>
          <PrimaryButton
            type="button"
            disabled={isSubmitting}
            onClick={onConfirm}
            data-testid="dental-no-teeth-confirm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Saving...
              </>
            ) : (
              "Save without teeth"
            )}
          </PrimaryButton>
        </>
      }
    >
      <p className="text-sm text-brand-slate">
        Do you want to proceed and save this treatment without teeth details? Use
        this for whole-mouth treatments such as scaling or consultations.
      </p>
    </SectionedDialog>
  );
}
